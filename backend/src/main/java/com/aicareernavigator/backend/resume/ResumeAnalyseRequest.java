package com.aicareernavigator.backend.resume;


/**
 * Request payload sent to the FastAPI AI service for resume analysis.
 */
public record ResumeAnalyseRequest(
        String resumeText,
        String jobDescription
) {}
