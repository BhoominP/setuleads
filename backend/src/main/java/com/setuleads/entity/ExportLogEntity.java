package com.setuleads.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "export_logs")
public class ExportLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "lead_count")
    private Integer leadCount;

    @Column(name = "filter_criteria", columnDefinition = "TEXT")
    private String filterCriteria;

    @Column(name = "exported_at", insertable = false, updatable = false)
    private OffsetDateTime exportedAt;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Integer getLeadCount() {
        return leadCount;
    }

    public void setLeadCount(Integer leadCount) {
        this.leadCount = leadCount;
    }

    public String getFilterCriteria() {
        return filterCriteria;
    }

    public void setFilterCriteria(String filterCriteria) {
        this.filterCriteria = filterCriteria;
    }

    public OffsetDateTime getExportedAt() {
        return exportedAt;
    }

    public void setExportedAt(OffsetDateTime exportedAt) {
        this.exportedAt = exportedAt;
    }
}
