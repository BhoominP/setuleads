package com.setuleads.repository;

import com.setuleads.entity.LeadEntity;
import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeadRepository extends JpaRepository<LeadEntity, UUID>, JpaSpecificationExecutor<LeadEntity> {

    Optional<LeadEntity> findByGooglePlaceId(String googlePlaceId);

    Optional<LeadEntity> findByOsmTypeAndOsmId(String osmType, String osmId);

    List<LeadEntity> findByStage(LeadStage stage);

    List<LeadEntity> findBySource(LeadSource source);

    List<LeadEntity> findByEmailIgnoreCase(String email);

    List<LeadEntity> findByWebsiteUrlIgnoreCase(String websiteUrl);

    List<LeadEntity> findByBusinessNameIgnoreCase(String businessName);

    @Query("SELECT l FROM LeadEntity l WHERE " +
           "(:stage IS NULL OR l.stage = :stage) AND " +
           "(:source IS NULL OR l.source = :source) AND " +
           "(:search IS NULL OR LOWER(l.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.location) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:minScore IS NULL OR l.websiteScore >= :minScore) AND " +
           "(:maxScore IS NULL OR l.websiteScore <= :maxScore)")
    List<LeadEntity> filterLeads(
            @Param("stage") LeadStage stage,
            @Param("source") LeadSource source,
            @Param("search") String search,
            @Param("minScore") Integer minScore,
            @Param("maxScore") Integer maxScore
    );
}
