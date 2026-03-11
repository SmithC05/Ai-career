package com.aicareernavigator.backend.advisorchat;

import com.aicareernavigator.backend.ai.CareerAdviceResponse;
import com.aicareernavigator.backend.user.AppUser;
import com.aicareernavigator.backend.user.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class AdvisorChatService {

    private static final TypeReference<List<String>> STRING_LIST_TYPE = new TypeReference<>() {};

    private final UserRepository userRepository;
    private final AdvisorChatRepository advisorChatRepository;
    private final ObjectMapper objectMapper;

    public AdvisorChatService(UserRepository userRepository,
                              AdvisorChatRepository advisorChatRepository,
                              ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.advisorChatRepository = advisorChatRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void saveAdvice(String requesterEmail, String question, CareerAdviceResponse response) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        AdvisorChat chat = new AdvisorChat();
        chat.setUser(user);
        chat.setQuestion(question);
        chat.setAnswer(response.answer());
        chat.setSuggestedCareers(serializeList(response.suggestedCareers()));
        chat.setNextSteps(serializeList(response.nextSteps()));

        advisorChatRepository.save(chat);
    }

    @Transactional(readOnly = true)
    public List<AdvisorChatHistoryItem> getHistory(String requesterEmail) {
        AppUser user = userRepository.findByEmail(requesterEmail)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        return advisorChatRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream()
            .map(this::toHistoryItem)
            .toList();
    }

    private AdvisorChatHistoryItem toHistoryItem(AdvisorChat chat) {
        return new AdvisorChatHistoryItem(
            chat.getId(),
            chat.getQuestion(),
            chat.getAnswer(),
            deserializeList(chat.getSuggestedCareers()),
            deserializeList(chat.getNextSteps()),
            chat.getCreatedAt()
        );
    }

    private String serializeList(List<String> values) {
        try {
            return objectMapper.writeValueAsString(values == null ? List.of() : values);
        } catch (JsonProcessingException ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to serialize chat fields", ex);
        }
    }

    private List<String> deserializeList(String json) {
        try {
            return objectMapper.readValue(json, STRING_LIST_TYPE);
        } catch (JsonProcessingException ex) {
            return List.of();
        }
    }
}
