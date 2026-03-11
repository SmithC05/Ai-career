package com.aicareernavigator.backend.career;

import com.aicareernavigator.backend.skill.Skill;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "careers")
public class Career {

    @Id
    @Column(columnDefinition = "uuid")
    private UUID id;

    @Column(name = "career_name", nullable = false, unique = true)
    private String careerName;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "avg_salary", nullable = false)
    private BigDecimal avgSalary;

    @Column(name = "job_security", nullable = false)
    private String jobSecurity;

    @Column(name = "growth_rate", nullable = false)
    private String growthRate;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "job_demand", nullable = false)
    private String jobDemand;

    @Column(name = "work_life_balance", nullable = false)
    private String workLifeBalance;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "career_skills",
        joinColumns = @JoinColumn(name = "career_id"),
        inverseJoinColumns = @JoinColumn(name = "skill_id")
    )
    private Set<Skill> skills = new LinkedHashSet<>();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCareerName() {
        return careerName;
    }

    public void setCareerName(String careerName) {
        this.careerName = careerName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getAvgSalary() {
        return avgSalary;
    }

    public void setAvgSalary(BigDecimal avgSalary) {
        this.avgSalary = avgSalary;
    }

    public String getJobSecurity() {
        return jobSecurity;
    }

    public void setJobSecurity(String jobSecurity) {
        this.jobSecurity = jobSecurity;
    }

    public String getGrowthRate() {
        return growthRate;
    }

    public void setGrowthRate(String growthRate) {
        this.growthRate = growthRate;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public String getJobDemand() {
        return jobDemand;
    }

    public void setJobDemand(String jobDemand) {
        this.jobDemand = jobDemand;
    }

    public String getWorkLifeBalance() {
        return workLifeBalance;
    }

    public void setWorkLifeBalance(String workLifeBalance) {
        this.workLifeBalance = workLifeBalance;
    }

    public Set<Skill> getSkills() {
        return skills;
    }

    public void setSkills(Set<Skill> skills) {
        this.skills = skills;
    }
}
