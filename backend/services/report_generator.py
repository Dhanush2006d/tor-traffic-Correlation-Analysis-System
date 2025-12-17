from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.platypus import PageBreak, HRFlowable
from datetime import datetime
import os

class ForensicReportGenerator:
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        self.styles.add(ParagraphStyle(
            name='ReportTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            textColor=colors.HexColor('#1a1a2e'),
            alignment=1
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#16213e'),
            borderWidth=1,
            borderColor=colors.HexColor('#0f3460'),
            borderPadding=5
        ))
        
        self.styles.add(ParagraphStyle(
            name='Disclaimer',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.HexColor('#8b0000'),
            backColor=colors.HexColor('#fff0f0'),
            borderWidth=1,
            borderColor=colors.HexColor('#8b0000'),
            borderPadding=10,
            spaceBefore=20,
            spaceAfter=20
        ))
        
        self.styles.add(ParagraphStyle(
            name='ConfidenceHigh',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#228b22')
        ))
        
        self.styles.add(ParagraphStyle(
            name='ConfidenceMedium',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#daa520')
        ))
        
        self.styles.add(ParagraphStyle(
            name='ConfidenceLow',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#dc143c')
        ))
    
    def generate_report(self, analysis_data: dict) -> str:
        case_id = analysis_data.get('case_id', 'UNKNOWN')
        filename = f"forensic_report_{case_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        filepath = os.path.join(self.output_dir, filename)
        
        doc = SimpleDocTemplate(
            filepath,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.75*inch,
            bottomMargin=0.75*inch
        )
        
        story = []
        
        story.append(Paragraph("TOR TRAFFIC CORRELATION", self.styles['ReportTitle']))
        story.append(Paragraph("FORENSIC ANALYSIS REPORT", self.styles['ReportTitle']))
        story.append(Spacer(1, 20))
        
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#0f3460')))
        story.append(Spacer(1, 20))
        
        disclaimer_text = (
            "<b>LEGAL DISCLAIMER:</b> This report presents PROBABILISTIC CORRELATION ANALYSIS only. "
            "The results herein do NOT constitute definitive identification or de-anonymization of TOR traffic. "
            "All findings should be treated as investigative leads requiring independent verification through "
            "proper legal channels. This analysis uses statistical methods and pattern matching which may "
            "produce false positives. Results must be corroborated with additional evidence before any "
            "legal action is taken."
        )
        story.append(Paragraph(disclaimer_text, self.styles['Disclaimer']))
        
        story.append(Paragraph("CASE INFORMATION", self.styles['SectionHeader']))
        
        case_data = [
            ["Case ID:", case_id],
            ["Session ID:", analysis_data.get('session_id', 'N/A')],
            ["Analysis Date:", datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')],
            ["Report Generated:", datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ["Status:", analysis_data.get('status', 'Completed')]
        ]
        
        case_table = Table(case_data, colWidths=[2*inch, 4.5*inch])
        case_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f0f0')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#1a1a2e')),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc'))
        ]))
        story.append(case_table)
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("CONFIDENCE SCORING", self.styles['SectionHeader']))
        
        timing_score = analysis_data.get('timing_score', 0)
        volume_score = analysis_data.get('volume_score', 0)
        pattern_score = analysis_data.get('pattern_score', 0)
        overall = analysis_data.get('overall_confidence', 0)
        
        def get_confidence_color(score):
            if score >= 60:
                return colors.HexColor('#228b22')
            elif score >= 30:
                return colors.HexColor('#daa520')
            else:
                return colors.HexColor('#dc143c')
        
        confidence_data = [
            ["Metric", "Score", "Interpretation"],
            ["Timing Correlation", f"{timing_score:.1f}%", self._interpret_score(timing_score)],
            ["Volume Correlation", f"{volume_score:.1f}%", self._interpret_score(volume_score)],
            ["Pattern Similarity", f"{pattern_score:.1f}%", self._interpret_score(pattern_score)],
            ["OVERALL CONFIDENCE", f"{overall:.1f}%", self._interpret_score(overall)]
        ]
        
        conf_table = Table(confidence_data, colWidths=[2*inch, 1.5*inch, 3*inch])
        conf_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f3460')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8e8e8')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('ALIGN', (1, 0), (1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#cccccc'))
        ]))
        story.append(conf_table)
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("PROBABLE TOR CIRCUIT PATH", self.styles['SectionHeader']))
        
        circuit = analysis_data.get('circuit', {})
        
        entry = circuit.get('entry', {})
        middle = circuit.get('middle', {})
        exit_node = circuit.get('exit', {})
        
        circuit_text = (
            f"<b>Entry/Guard Node:</b><br/>"
            f"&nbsp;&nbsp;Nickname: {entry.get('nickname', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;Country: {entry.get('country', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;IP (Masked): {entry.get('ip_masked', 'xxx.xxx.xxx.xxx')}<br/><br/>"
            f"<b>Middle Relay:</b><br/>"
            f"&nbsp;&nbsp;Nickname: {middle.get('nickname', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;Country: {middle.get('country', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;IP (Masked): {middle.get('ip_masked', 'xxx.xxx.xxx.xxx')}<br/><br/>"
            f"<b>Exit Node:</b><br/>"
            f"&nbsp;&nbsp;Nickname: {exit_node.get('nickname', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;Country: {exit_node.get('country', 'Unknown')}<br/>"
            f"&nbsp;&nbsp;IP (Masked): {exit_node.get('ip_masked', 'xxx.xxx.xxx.xxx')}"
        )
        story.append(Paragraph(circuit_text, self.styles['Normal']))
        story.append(Spacer(1, 15))
        
        probable_origin = analysis_data.get('probable_origin', 'Unable to determine')
        origin_text = f"<b>Probable Origin Association:</b> {probable_origin}"
        story.append(Paragraph(origin_text, self.styles['Normal']))
        story.append(Spacer(1, 20))
        
        story.append(Paragraph("ANALYSIS JUSTIFICATION", self.styles['SectionHeader']))
        
        justification = analysis_data.get('justification', 'No justification provided.')
        for para in justification.split('\n\n'):
            if para.strip():
                story.append(Paragraph(para.replace('\n', '<br/>'), self.styles['Normal']))
                story.append(Spacer(1, 10))
        
        story.append(Spacer(1, 20))
        
        if analysis_data.get('analyst_notes'):
            story.append(Paragraph("ANALYST NOTES", self.styles['SectionHeader']))
            story.append(Paragraph(analysis_data['analyst_notes'], self.styles['Normal']))
            story.append(Spacer(1, 20))
        
        story.append(Paragraph("EVIDENCE INTEGRITY", self.styles['SectionHeader']))
        
        evidence_hash = analysis_data.get('evidence_hash', 'Not computed')
        hash_text = f"<b>SHA-256 Hash:</b><br/><font size='9'>{evidence_hash}</font>"
        story.append(Paragraph(hash_text, self.styles['Normal']))
        story.append(Spacer(1, 10))
        
        story.append(Paragraph(
            "This hash can be used to verify the integrity of the analysis data. "
            "Any modification to the underlying data will result in a different hash value.",
            self.styles['Normal']
        ))
        
        story.append(Spacer(1, 30))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 10))
        
        footer_text = (
            "<font size='8'>This report was generated by the TOR Traffic Correlation Analysis System. "
            "For questions regarding this analysis, contact your forensic analysis team. "
            "This document is intended for law enforcement use only.</font>"
        )
        story.append(Paragraph(footer_text, self.styles['Normal']))
        
        doc.build(story)
        
        return filepath
    
    def _interpret_score(self, score: float) -> str:
        if score >= 70:
            return "Strong correlation detected"
        elif score >= 50:
            return "Moderate correlation detected"
        elif score >= 30:
            return "Weak correlation detected"
        else:
            return "Insufficient correlation"
