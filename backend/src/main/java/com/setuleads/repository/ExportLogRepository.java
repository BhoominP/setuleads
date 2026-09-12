package com.setuleads.repository;

import com.setuleads.entity.ExportLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ExportLogRepository extends JpaRepository<ExportLogEntity, UUID> {
}
