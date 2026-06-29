import io
import uuid
from datetime import UTC, datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.graphics.shapes import Drawing
from reportlab.graphics.charts.piecharts import Pie

from app.models.scan import Scan

def add_header_footer(canvas, doc):
    canvas.saveState()
    # Footer
    canvas.setFont('Helvetica', 9)
    canvas.setFillColor(colors.gray)
    canvas.drawString(inch, 0.5 * inch, f"AegisSec Enterprise Report | Generated: {datetime.now(UTC).strftime('%Y-%m-%d %H:%M UTC')}")
    canvas.drawRightString(7.5 * inch, 0.5 * inch, f"Page {doc.page}")
    
    # Header line
    aegis_blue = colors.HexColor("#1e3a8a")
    canvas.setStrokeColor(aegis_blue)
    canvas.setLineWidth(1)
    canvas.line(inch, 10.5 * inch, 7.5 * inch, 10.5 * inch)
    canvas.restoreState()

def generate_ai_summary(scan: Scan) -> str:
    critical_count = sum(1 for f in scan.findings if f.severity == "critical")
    high_count = sum(1 for f in scan.findings if f.severity == "high")
    total_findings = len(scan.findings)
    
    if total_findings == 0:
        return f"AegisSec's AI analysis of the '{scan.name}' assessment reveals a strong security posture with no immediate vulnerabilities detected on the primary attack surface. Continuous monitoring is recommended."
        
    summary = f"AegisSec's AI engine has analyzed {total_findings} discovered vulnerabilities across the '{scan.name}' assessment. "
    
    if scan.risk_score > 75:
        summary += f"The overall risk posture is critical (Score: {scan.risk_score}/100), primarily driven by {critical_count} critical and {high_count} high-severity findings. "
        summary += "Immediate remediation is required to prevent potential exploitation. "
    elif scan.risk_score > 40:
        summary += f"The overall risk posture is moderate (Score: {scan.risk_score}/100). While no imminent critical threats dominate the landscape, {high_count} high-severity weaknesses were identified that require scheduled patching. "
    else:
        summary += f"The overall risk posture is low (Score: {scan.risk_score}/100). The attack surface is well-defended, though minor security hygiene improvements are recommended based on the findings. "
        
    mitre_tags = list(set([f.mitre_attack for f in scan.findings if f.mitre_attack]))
    if mitre_tags:
        summary += f"Threat intelligence mapping indicates exposure to several MITRE ATT&CK techniques, notably: {', '.join(mitre_tags[:3])}. "
        
    summary += "Prioritize remediation efforts based on the CVSS 3.1 scoring and Evidence logs detailed below."
    return summary

def generate_pdf_report(scan: Scan) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=50, leftMargin=50, topMargin=72, bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    brand_color = colors.HexColor("#1e3a8a")
    critical_color = colors.HexColor("#dc2626")
    high_color = colors.HexColor("#ea580c")
    medium_color = colors.HexColor("#eab308")
    low_color = colors.HexColor("#3b82f6")
    info_color = colors.HexColor("#6b7280")
    
    styles.add(ParagraphStyle(name='TitlePage', parent=styles['Heading1'], fontSize=28, textColor=brand_color, alignment=1, spaceAfter=20))
    styles.add(ParagraphStyle(name='SubtitlePage', parent=styles['Normal'], fontSize=16, textColor=colors.gray, alignment=1, spaceAfter=40))
    styles.add(ParagraphStyle(name='SectionHeader', parent=styles['Heading2'], fontSize=18, textColor=brand_color, spaceBefore=20, spaceAfter=10))
    styles.add(ParagraphStyle(name='Metadata', parent=styles['Normal'], fontSize=11, leading=16))
    styles.add(ParagraphStyle(name='AISummary', parent=styles['Normal'], fontSize=11, leading=16, textColor=colors.HexColor("#334155"), spaceAfter=20, backColor=colors.HexColor("#f8fafc"), borderPadding=10, borderColor=colors.HexColor("#cbd5e1"), borderWidth=1))
    styles.add(ParagraphStyle(name='FindingTitle', parent=styles['Heading3'], fontSize=14, textColor=brand_color, spaceBefore=15, spaceAfter=6))
    styles.add(ParagraphStyle(name='FindingLabel', parent=styles['Normal'], fontName='Helvetica-Bold', fontSize=10))
    styles.add(ParagraphStyle(name='FindingValue', parent=styles['Normal'], fontSize=10, leading=14))
    
    # Use a custom style for evidence block since Preformatted isn't always ideal for wrapping
    styles.add(ParagraphStyle(
        name='EvidenceBlock', 
        parent=styles['Normal'], 
        fontName='Courier', 
        fontSize=9, 
        textColor=colors.darkblue, 
        backColor=colors.whitesmoke,
        leftIndent=10, 
        rightIndent=10,
        spaceBefore=4,
        spaceAfter=4,
        borderWidth=1,
        borderColor=colors.lightgrey,
        borderPadding=6
    ))
    
    Story = []
    
    # --- COVER PAGE ---
    Story.append(Spacer(1, 2 * inch))
    Story.append(Paragraph("AegisSec", styles['TitlePage']))
    Story.append(Paragraph("Enterprise Security Assessment Report", styles['SubtitlePage']))
    
    target_val = scan.target.value if scan.target else "Unknown Target"
    report_id = f"RPT-{uuid.uuid4().hex[:8].upper()}"
    
    Story.append(Paragraph(f"<b>Target:</b> {target_val}", styles['Metadata']))
    Story.append(Paragraph(f"<b>Scan Name:</b> {scan.name}", styles['Metadata']))
    Story.append(Paragraph(f"<b>Scan ID:</b> {scan.id}", styles['Metadata']))
    Story.append(Paragraph(f"<b>Report ID:</b> {report_id}", styles['Metadata']))
    Story.append(Paragraph(f"<b>Generated On:</b> {datetime.now(UTC).strftime('%B %d, %Y - %H:%M:%S UTC')}", styles['Metadata']))
    
    Story.append(PageBreak())
    
    # --- EXECUTIVE DASHBOARD ---
    Story.append(Paragraph("Executive Dashboard", styles['SectionHeader']))
    
    ai_summary = generate_ai_summary(scan)
    Story.append(Paragraph(f"<b>AI Executive Summary:</b><br/>{ai_summary}", styles['AISummary']))
    Story.append(Spacer(1, 15))
    
    Story.append(Paragraph(f"The automated assessment of <b>{target_val}</b> concluded with an overall Risk Score of <b>{scan.risk_score}/100</b>.", styles['Normal']))
    Story.append(Spacer(1, 20))
    
    # Calculate Severity Distribution
    sev_counts = {"critical": 0, "high": 0, "medium": 0, "low": 0, "info": 0}
    if scan.findings:
        for f in scan.findings:
            sev = f.severity.lower()
            if sev in sev_counts:
                sev_counts[sev] += 1
                
    # Draw Pie Chart
    has_findings = any(v > 0 for v in sev_counts.values())
    if has_findings:
        d = Drawing(400, 200)
        pie = Pie()
        pie.x = 125
        pie.y = 25
        pie.width = 150
        pie.height = 150
        pie.data = [
            sev_counts["critical"], sev_counts["high"], 
            sev_counts["medium"], sev_counts["low"], sev_counts["info"]
        ]
        pie.labels = ['Critical', 'High', 'Medium', 'Low', 'Info']
        
        pie.slices[0].fillColor = critical_color
        pie.slices[1].fillColor = high_color
        pie.slices[2].fillColor = medium_color
        pie.slices[3].fillColor = low_color
        pie.slices[4].fillColor = info_color
        
        for i, val in enumerate(pie.data):
            if val == 0:
                pie.labels[i] = ""
                
        d.add(pie)
        Story.append(d)
        Story.append(Spacer(1, 20))
    
    # --- FINDINGS SUMMARY TABLE ---
    Story.append(Paragraph("Vulnerability Summary", styles['SectionHeader']))
    if scan.findings:
        data = [['Severity', 'Title', 'Priority', 'CVSS']]
        for f in scan.findings:
            data.append([
                f.severity.upper(), 
                Paragraph(f.title, styles['Normal']), 
                f.remediation_priority or "-", 
                str(f.cvss)
            ])
            
        t = Table(data, colWidths=[60, 250, 70, 40])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), brand_color),
            ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0,0), (-1,0), 10),
            ('TOPPADDING', (0,0), (-1,0), 10),
            ('GRID', (0,0), (-1,-1), 0.5, colors.grey),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        Story.append(t)
    else:
        Story.append(Paragraph("No vulnerabilities discovered.", styles['Normal']))
        
    Story.append(PageBreak())
    
    # --- DETAILED FINDINGS ---
    Story.append(Paragraph("Detailed Technical Findings", styles['SectionHeader']))
    
    if not scan.findings:
        Story.append(Paragraph("No findings to detail.", styles['Normal']))
        
    for idx, f in enumerate(scan.findings, 1):
        Story.append(Paragraph(f"{idx}. {f.title}", styles['FindingTitle']))
        
        # Metadata block for finding
        meta_data = [
            [Paragraph("<b>Severity:</b>", styles['FindingLabel']), Paragraph(f.severity.upper(), styles['FindingValue']),
             Paragraph("<b>CVSS v3.1:</b>", styles['FindingLabel']), Paragraph(str(f.cvss), styles['FindingValue'])],
             
            [Paragraph("<b>Priority:</b>", styles['FindingLabel']), Paragraph(f.remediation_priority or "N/A", styles['FindingValue']),
             Paragraph("<b>CWE:</b>", styles['FindingLabel']), Paragraph(f.cwe or "N/A", styles['FindingValue'])],
             
            [Paragraph("<b>OWASP:</b>", styles['FindingLabel']), Paragraph(f.owasp or "N/A", styles['FindingValue']),
             Paragraph("<b>MITRE:</b>", styles['FindingLabel']), Paragraph(f.mitre_attack or "N/A", styles['FindingValue'])]
        ]
        
        mt = Table(meta_data, colWidths=[60, 150, 60, 150])
        mt.setStyle(TableStyle([
            ('GRID', (0,0), (-1,-1), 0.5, colors.lightgrey),
            ('BACKGROUND', (0,0), (0,-1), colors.whitesmoke),
            ('BACKGROUND', (2,0), (2,-1), colors.whitesmoke),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        Story.append(mt)
        Story.append(Spacer(1, 10))
        
        Story.append(Paragraph("<b>Description:</b>", styles['FindingLabel']))
        Story.append(Paragraph(f.description, styles['FindingValue']))
        Story.append(Spacer(1, 8))
        
        if f.evidence:
            Story.append(Paragraph("<b>Evidence:</b>", styles['FindingLabel']))
            Story.append(Paragraph(f.evidence.replace("\n", "<br/>"), styles['EvidenceBlock']))
            Story.append(Spacer(1, 8))
            
        Story.append(Paragraph("<b>Recommendation:</b>", styles['FindingLabel']))
        Story.append(Paragraph(f.recommendation, styles['FindingValue']))
        Story.append(Spacer(1, 20))
    
    # Build doc with header/footer
    doc.build(Story, onFirstPage=add_header_footer, onLaterPages=add_header_footer)
    
    pdf = buffer.getvalue()
    buffer.close()
    return pdf
