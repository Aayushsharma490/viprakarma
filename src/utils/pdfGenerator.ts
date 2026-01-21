import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const generateKundaliPDF = async (kundaliData: any, language: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('कुंडली रिपोर्ट', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Basic Details
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('मूल विवरण', 14, yPos);
    yPos += 8;

    const basicDetails = [
        ['नाम', kundaliData.basicDetails?.name || 'N/A'],
        ['जन्म तिथि', kundaliData.basicDetails?.birthDate || 'N/A'],
        ['जन्म समय', kundaliData.basicDetails?.localTime || 'N/A'],
        ['स्थान', kundaliData.basicDetails?.location?.city || 'N/A'],
        ['लग्न', kundaliData.ascendant?.sign || 'N/A'],
        ['चंद्र राशि', kundaliData.moonSign || 'N/A'],
        ['सूर्य राशि', kundaliData.sunSign || 'N/A'],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['विवरण', 'मान']],
        body: basicDetails,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], fontSize: 11, fontStyle: 'bold' },
        styles: { fontSize: 10 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // CHART CAPTURE - Improved approach
    const captureChart = async (selector: string, title: string) => {
        try {
            // Try multiple times with delays
            for (let attempt = 0; attempt < 3; attempt++) {
                await wait(1000);
                const element = document.querySelector(selector) as HTMLElement;

                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) {
                        const canvas = await html2canvas(element, {
                            scale: 2,
                            backgroundColor: '#ffffff',
                            logging: false,
                            useCORS: true,
                            allowTaint: true,
                            width: rect.width,
                            height: rect.height
                        });

                        return canvas.toDataURL('image/png');
                    }
                }
                console.log(`Attempt ${attempt + 1} failed for ${title}`);
            }
            return null;
        } catch (error) {
            console.error(`Error capturing ${title}:`, error);
            return null;
        }
    };

    // Capture all charts
    const charts = [
        { selector: '[data-chart-type="lagna"]', title: 'लग्न कुंडली' },
        { selector: '[data-chart-type="chandra"]', title: 'चंद्र कुंडली' },
        { selector: '[data-chart-type="navamsa"]', title: 'नवांश कुंडली (D9)' },
        { selector: '[data-chart-type="d10"]', title: 'दशमांश कुंडली (D10)' }
    ];

    for (const chart of charts) {
        if (yPos > 200) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(chart.title, 14, yPos);
        yPos += 8;

        const imgData = await captureChart(chart.selector, chart.title);

        if (imgData) {
            const img = new Image();
            img.src = imgData;
            const imgWidth = 160;
            const imgHeight = 160; // Square charts

            if (yPos + imgHeight > 270) {
                doc.addPage();
                yPos = 20;
            }

            doc.addImage(imgData, 'PNG', 25, yPos, imgWidth, imgHeight);
            yPos += imgHeight + 15;
            console.log(`${chart.title} added to PDF`);
        } else {
            doc.setFontSize(10);
            doc.text('(चार्ट उपलब्ध नहीं है)', 14, yPos);
            yPos += 15;
        }
    }

    // Nakshatra Details
    if (kundaliData.nakshatras) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('नक्षत्र विवरण', 14, yPos);
        yPos += 8;

        const nakshatraData = [
            ['सूर्य', kundaliData.nakshatras.sun?.name || 'N/A', `पद ${kundaliData.nakshatras.sun?.pada || 'N/A'}`, kundaliData.nakshatras.sun?.lord || 'N/A'],
            ['चंद्र', kundaliData.nakshatras.moon?.name || 'N/A', `पद ${kundaliData.nakshatras.moon?.pada || 'N/A'}`, kundaliData.nakshatras.moon?.lord || 'N/A'],
            ['लग्न', kundaliData.nakshatras.ascendant?.name || 'N/A', `पद ${kundaliData.nakshatras.ascendant?.pada || 'N/A'}`, kundaliData.nakshatras.ascendant?.lord || 'N/A'],
        ];

        autoTable(doc, {
            startY: yPos,
            head: [['प्रकार', 'नक्षत्र', 'पद', 'स्वामी']],
            body: nakshatraData,
            theme: 'striped',
            headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
    }

    // Mahadasha
    if (kundaliData.dashas?.mahadashas) {
        if (yPos > 200) {
            doc.addPage();
            yPos = 20;
        }

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('महादशा अवधि', 14, yPos);
        yPos += 8;

        const mahadashaData = kundaliData.dashas.mahadashas.slice(0, 9).map((dasha: any) => [
            dasha.planet,
            dasha.startDate,
            dasha.endDate,
            `${dasha.years} वर्ष`
        ]);

        autoTable(doc, {
            startY: yPos,
            head: [['ग्रह', 'आरंभ', 'समाप्ति', 'अवधि']],
            body: mahadashaData,
            theme: 'grid',
            headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
            styles: { fontSize: 9 },
        });

        yPos = (doc as any).lastAutoTable.finalY + 12;
    }

    // Panchang
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('पूर्ण पंचांग', 14, yPos);
    yPos += 8;

    const panchangData = [
        ['विक्रम संवत', kundaliData.enhancedDetails?.vikramSamvat || 'N/A'],
        ['शालिवाहन शके', kundaliData.enhancedDetails?.shalivahanaShake || 'N/A'],
        ['तिथि', kundaliData.enhancedDetails?.tithi?.name || 'N/A'],
        ['पक्ष', kundaliData.enhancedDetails?.paksha || 'N/A'],
        ['मास', kundaliData.enhancedDetails?.masa || 'N/A'],
        ['योग', kundaliData.enhancedDetails?.yoga || 'N/A'],
        ['करण', kundaliData.enhancedDetails?.karana || 'N/A'],
        ['दिन', kundaliData.enhancedDetails?.dayOfWeek || 'N/A'],
        ['चंद्र राशि', kundaliData.enhancedDetails?.chandraRashi || 'N/A'],
        ['सूर्य राशि', kundaliData.enhancedDetails?.suryaRashi || 'N/A'],
        ['बृहस्पति राशि', kundaliData.enhancedDetails?.brihaspatiRashi || 'N/A'],
        ['ऋतू', kundaliData.enhancedDetails?.ritu || 'N/A'],
        ['आयन', kundaliData.enhancedDetails?.ayana || 'N/A'],
        ['सूर्योदय', kundaliData.enhancedDetails?.sunrise || 'N/A'],
        ['सूर्यास्त', kundaliData.enhancedDetails?.sunset || 'N/A'],
        ['चंद्रोदय', kundaliData.enhancedDetails?.moonrise || 'N/A'],
        ['चंद्रास्त', kundaliData.enhancedDetails?.moonset || 'N/A'],
        ['सूर्योदय पर लग्न', kundaliData.enhancedDetails?.lagnaAtSunrise || 'N/A'],
    ];

    autoTable(doc, {
        startY: yPos,
        head: [['विवरण', 'मान']],
        body: panchangData,
        theme: 'striped',
        headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9 },
    });

    // Planetary Positions
    doc.addPage();
    yPos = 20;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ग्रह स्थिति', 14, yPos);
    yPos += 8;

    const planetData = kundaliData.planets?.map((p: any) => [
        p.name,
        p.sign,
        `${p.degreeInSign.toFixed(2)}°`,
        `भाव ${p.house}`,
        p.nakshatra?.name || 'N/A',
        p.retrograde ? 'R' : '-'
    ]) || [];

    autoTable(doc, {
        startY: yPos,
        head: [['ग्रह', 'राशि', 'अंश', 'भाव', 'नक्षत्र', 'R']],
        body: planetData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246], fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9 },
    });

    // Phallit
    if (kundaliData.phallit) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('फलित (भविष्यवाणी)', pageWidth / 2, yPos, { align: 'center' });
        yPos += 12;

        const phallitSections = [
            { title: '१. लग्न व्यक्तित्व', data: kundaliData.phallit.lagnaPersonality['hi'] },
            { title: '२. चंद्र और भावनाएं', data: kundaliData.phallit.moonEmotions['hi'] },
            { title: '३. शिक्षा', data: kundaliData.phallit.education['hi'] },
            { title: '४. करियर विश्लेषण', data: kundaliData.phallit.career['hi'] },
            { title: '५. धन और वित्त', data: kundaliData.phallit.wealth['hi'] },
            { title: '६. विवाह और संबंध', data: kundaliData.phallit.relationships['hi'] },
            { title: '७. स्वास्थ्य', data: kundaliData.phallit.health['hi'] },
            { title: '८. दोष और योग', data: kundaliData.phallit.doshasYogas['hi'] },
            { title: '९. दशा समयरेखा', data: kundaliData.phallit.dashaPredictions['hi'] },
            { title: '१०. उपाय', data: kundaliData.phallit.remedies['hi'] },
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
        'VipraKarma - सटीक वैदिक ज्योतिष',
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
    );

    const fileName = `Kundali_${kundaliData.basicDetails?.name || 'Report'}_${new Date().getTime()}.pdf`;
    doc.save(fileName);
};
