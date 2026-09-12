package com.setuleads.service;

import com.setuleads.entity.ExportLogEntity;
import com.setuleads.entity.LeadEntity;
import com.setuleads.entity.LeadSource;
import com.setuleads.entity.LeadStage;
import com.setuleads.repository.ExportLogRepository;
import com.setuleads.repository.LeadRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ExcelExportService {

    private static final Logger logger = LoggerFactory.getLogger(ExcelExportService.class);

    private final LeadRepository leadRepository;
    private final ExportLogRepository exportLogRepository;

    public ExcelExportService(LeadRepository leadRepository, ExportLogRepository exportLogRepository) {
        this.leadRepository = leadRepository;
        this.exportLogRepository = exportLogRepository;
    }

    @Transactional
    public byte[] exportLeadsToExcel(LeadStage stage, LeadSource source, String search, Integer minScore, Integer maxScore) {
        List<LeadEntity> leads = leadRepository.filterLeads(stage, source, search, minScore, maxScore);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Leads");

            // Header Style
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            font.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(font);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            String[] headers = {
                "ID", "Business Name", "Contact Name", "Email", "Phone",
                "Website URL", "Source", "Source Query", "Location", "Stage",
                "Estimated Value", "Website Score", "Created At"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIdx = 1;
            for (LeadEntity lead : leads) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(lead.getId().toString());
                row.createCell(1).setCellValue(lead.getBusinessName());
                row.createCell(2).setCellValue(lead.getContactName() != null ? lead.getContactName() : "");
                row.createCell(3).setCellValue(lead.getEmail() != null ? lead.getEmail() : "");
                row.createCell(4).setCellValue(lead.getPhone() != null ? lead.getPhone() : "");
                row.createCell(5).setCellValue(lead.getWebsiteUrl() != null ? lead.getWebsiteUrl() : "");
                row.createCell(6).setCellValue(lead.getSource() != null ? lead.getSource().name() : "");
                row.createCell(7).setCellValue(lead.getSourceQuery() != null ? lead.getSourceQuery() : "");
                row.createCell(8).setCellValue(lead.getLocation() != null ? lead.getLocation() : "");
                row.createCell(9).setCellValue(lead.getStage() != null ? lead.getStage().name() : "");
                row.createCell(10).setCellValue(lead.getEstimatedValue() != null ? lead.getEstimatedValue().doubleValue() : 0.0);
                row.createCell(11).setCellValue(lead.getWebsiteScore() != null ? lead.getWebsiteScore() : 0);
                row.createCell(12).setCellValue(lead.getCreatedAt() != null ? lead.getCreatedAt().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);

            // Create ExportLog entry
            ExportLogEntity log = new ExportLogEntity();
            log.setLeadCount(leads.size());
            log.setFilterCriteria(String.format("stage=%s, source=%s, search=%s", stage, source, search));
            exportLogRepository.save(log);

            logger.info("EXCEL EXPORT: Exported {} leads", leads.size());
            return out.toByteArray();

        } catch (IOException e) {
            logger.error("Failed to generate Excel export", e);
            throw new RuntimeException("Failed to generate Excel file: " + e.getMessage());
        }
    }
}
