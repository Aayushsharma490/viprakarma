import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const isHindi = data.language === 'hi';

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPos = 20;

        // Title - Romanized Hindi for compatibility
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(isHindi ? 'Kundali Report (कुंडली रिपोर्ट)' : 'Kundali Report', pageWidth / 2, yPos, { align: 'center' });
        yPos += 15;

        // Basic Details
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(isHindi ? 'Mool Vivaran (मूल विवरण)' : 'Basic Details', 14, yPos);
        yPos += 8;

        const basicDetails = [
            [isHindi ? 'Naam (नाम)' : 'Name', data.basicDetails?.name || 'N/A'],
            [isHindi ? 'Janm Tithi (जन्म तिथि)' : 'Birth Date', data.basicDetails?.birthDate || 'N/A'],
            [isHindi ? 'Janm Samay (जन्म समय)' : 'Birth Time', data.basicDetails?.localTime || 'N/A'],
            [isHindi ? 'Sthan (स्थान)' : 'Location', data.basicDetails?.location?.city || 'N/A'],
            [isHindi ? 'Lagna (लग्न)' : 'Ascendant', data.ascendant?.sign || 'N/A'],
            [isHindi ? 'Chandra Rashi (चंद्र राशि)' : 'Moon Sign', data.moonSign || 'N/A'],
            [isHindi ? 'Surya Rashi (सूर्य राशि)' : 'Sun Sign', data.sunSign || 'N/A'],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [[isHindi ? 'Vivaran' : 'Detail', isHindi ? 'Maan' : 'Value']],
            body: basicDetails,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246], fontSize: 11, fontStyle: 'bold' },
            styles: { fontSize: 10 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;

        // Add Charts
        if (data.chartImages) {
            const charts = [
                { title: isHindi ? 'Lagna Kundali (लग्न कुंडली)' : 'Lagna Kundali', image: data.chartImages.lagna },
                { title: isHindi ? 'Chandra Kundali (चंद्र कुंडली)' : 'Chandra Kundali', image: data.chartImages.chandra },
                { title: isHindi ? 'Navamsa Kundali D9 (नवांश कुंडली)' : 'Navamsa Kundali (D9)', image: data.chartImages.navamsa },
                { title: isHindi ? 'Dashamsa Kundali D10 (दशमांश कुंडली)' : 'Dashamsa Kundali (D10)', image: data.chartImages.d10 },
            ];

            for (const chart of charts) {
                if (chart.image) {
                    if (yPos > 200) {
                        doc.addPage();
                        yPos = 20;
                    }

                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text(chart.title, 14, yPos);
                    yPos += 8;

                    try {
                        const imgWidth = 160;
                        const imgHeight = 160;

                        if (yPos + imgHeight > 270) {
                            doc.addPage();
                            yPos = 20;
                        }

                        doc.addImage(chart.image, 'PNG', 25, yPos, imgWidth, imgHeight);
                        yPos += imgHeight + 15;
                        console.log(`Added ${chart.title} to PDF`);
                    } catch (error) {
                        console.error(`Error adding ${chart.title}:`, error);
                        doc.setFontSize(10);
                        doc.text('(Chart image not available)', 14, yPos);
                        yPos += 10;
                    }
                } else {
                    console.warn(`${chart.title} image is null`);
                }
            }
        }

        // Add Panchang Details (English only)
        if (data.enhancedDetails) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Panchang Details', 14, yPos);
            yPos += 8;

            const panchangData = [
                ['Vikram Samvat', data.enhancedDetails.vikramSamvat || 'N/A'],
                ['Shalivahan Shake', data.enhancedDetails.vikramSamvat ? (data.enhancedDetails.vikramSamvat - 135).toString() : 'N/A'],
                ['Masa (Month)', data.enhancedDetails.masa || 'N/A'],
                ['Paksha (Fortnight)', data.enhancedDetails.paksha || 'N/A'],
                ['Tithi (Lunar Day)', data.enhancedDetails.tithi ? `${data.enhancedDetails.tithi.name} (${data.enhancedDetails.tithi.number})` : 'N/A'],
                ['Nakshatra Lord', data.enhancedDetails.nakshatraSwami || 'N/A'],
                ['Yoga', data.enhancedDetails.yoga || 'N/A'],
                ['Karana', data.enhancedDetails.karana || 'N/A'],
                ['Day of Week', data.enhancedDetails.dayOfWeek || 'N/A'],
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Detail', 'Value']],
                body: panchangData,
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246], fontSize: 11, fontStyle: 'bold' },
                styles: { fontSize: 10 },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add Planet Positions Table
        if (data.planets && data.planets.length > 0) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Planet Positions', 14, yPos);
            yPos += 8;

            const planetData = data.planets.map((p: any) => [
                p.name,
                p.sign,
                `${p.degreeInSign?.toFixed(2) || 'N/A'}°`,
                `House ${p.house}`,
                p.nakshatra?.name || 'N/A',
                p.isRetrograde ? 'Yes' : 'No'
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Planet', 'Sign', 'Degree', 'House', 'Nakshatra', 'Retrograde']],
                body: planetData,
                theme: 'grid',
                headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9 },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add Dashas (Mahadasha & Antardasha)
        if (data.dashas && data.dashas.mahadashas) {
            doc.addPage();
            yPos = 20;

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Vimshottari Dasha System', 14, yPos);
            yPos += 8;

            // Current Dasha
            if (data.dashas.current) {
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text('Current Mahadasha:', 14, yPos);
                yPos += 6;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text(`${data.dashas.current.planet} (${data.dashas.current.startDate} to ${data.dashas.current.endDate})`, 14, yPos);
                yPos += 10;
            }

            // Mahadasha Table
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Mahadasha Periods', 14, yPos);
            yPos += 6;

            const mahadashaData = data.dashas.mahadashas.slice(0, 9).map((d: any) => [
                d.planet,
                d.startDate,
                d.endDate,
                `${d.years} years`
            ]);

            autoTable(doc, {
                startY: yPos,
                head: [['Planet', 'Start Date', 'End Date', 'Duration']],
                body: mahadashaData,
                theme: 'grid',
                headStyles: { fillColor: [16, 185, 129], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 9 },
            });

            yPos = (doc as any).lastAutoTable.finalY + 10;
        }

        // Add Nakshatras Table
        if (data.nakshatras) {
            if (yPos > 200) {
                doc.addPage();
                yPos = 20;
            }

            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('Nakshatra Details', 14, yPos);
            yPos += 8;

            const nakshatraData = [
                ['Sun Nakshatra', data.nakshatras.sun?.name || 'N/A', data.nakshatras.sun?.lord || 'N/A', data.nakshatras.sun?.pada || 'N/A'],
                ['Moon Nakshatra', data.nakshatras.moon?.name || 'N/A', data.nakshatras.moon?.lord || 'N/A', data.nakshatras.moon?.pada || 'N/A'],
                ['Ascendant Nakshatra', data.nakshatras.ascendant?.name || 'N/A', data.nakshatras.ascendant?.lord || 'N/A', data.nakshatras.ascendant?.pada || 'N/A'],
            ];

            autoTable(doc, {
                startY: yPos,
                head: [['Position', 'Nakshatra', 'Lord', 'Pada']],
                body: nakshatraData,
                theme: 'grid',
                headStyles: { fillColor: [245, 158, 11], fontSize: 10, fontStyle: 'bold' },
                styles: { fontSize: 10 },
            });

            yPos = (doc as any).lastAutoTable.finalY + 15;
        }

        // Add Phallit if available
        if (data.phallit) {
            doc.addPage();
            yPos = 20;

            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text(isHindi ? 'Phallit (फलित भविष्यवाणी)' : 'Phallit (Predictions)', pageWidth / 2, yPos, { align: 'center' });
            yPos += 12;

            const phallitSections = [
                { title: isHindi ? '1. Lagna Vyaktitva (लग्न व्यक्तित्व)' : '1. Lagna Personality', data: data.phallit.lagnaPersonality[isHindi ? 'hi' : 'en'] },
                { title: isHindi ? '2. Chandra aur Bhavnayen (चंद्र और भावनाएं)' : '2. Moon & Emotions', data: data.phallit.moonEmotions[isHindi ? 'hi' : 'en'] },
                { title: isHindi ? '3. Shiksha (शिक्षा)' : '3. Education', data: data.phallit.education[isHindi ? 'hi' : 'en'] },
                { title: isHindi ? '4. Career Vishleshan (करियर विश्लेषण)' : '4. Career Analysis', data: data.phallit.career[isHindi ? 'hi' : 'en'] },
                { title: isHindi ? '5. Dhan aur Vitt (धन और वित्त)' : '5. Wealth & Finance', data: data.phallit.wealth[isHindi ? 'hi' : 'en'] },
            ];

            phallitSections.forEach((section) => {
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(section.title, 14, yPos);
                yPos += 7;

                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                const splitText = doc.splitTextToSize(section.data, pageWidth - 28);
                doc.text(splitText, 14, yPos);
                yPos += splitText.length * 5 + 10;
            });
        }

        // Footer
        const pageCount = (doc as any).internal.getNumberOfPages();
        doc.setPage(pageCount);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text(
            'VipraKarma - Vedic Astrology',
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        );

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename=Kundali_${data.basicDetails?.name || 'Report'}_${Date.now()}.pdf`,
            },
        });

    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
