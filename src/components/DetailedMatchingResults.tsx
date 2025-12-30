'use client';

import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface MatchingResultsProps {
    boyData: any;
    girlData: any;
    matchResult: any;
}

export default function DetailedMatchingResults({ boyData, girlData, matchResult }: MatchingResultsProps) {
    const { language } = useLanguage();

    // Generate interpretation dynamically from detail values
    const getInterpretation = (detail: any) => {
        const gunaName = detail.name.split('(')[0].trim();
        const boyVal = detail.boyValue || 'Unknown';
        const girlVal = detail.girlValue || 'Unknown';

        const interpretations: Record<string, { en: string; hi: string }> = {
            'Varna': {
                en: `The boy's varna is ${boyVal} while the girl belongs to ${girlVal} varna. This indicates their spiritual compatibility and ego levels.`,
                hi: `लड़के का वर्ण ${boyVal} है जबकि लड़की ${girlVal} वर्ण की है। यह उनकी आध्यात्मिक अनुकूलता को दर्शाता है।`
            },
            'Vashya': {
                en: `The boy belongs to ${boyVal} Vashya whereas the girl comes under ${girlVal} vashya. This determines mutual attraction and control in the relationship.`,
                hi: `लड़का ${boyVal} वश्य का है जबकि लड़की ${girlVal} वश्य की है। यह पारस्परिक आकर्षण निर्धारित करता है।`
            },
            'Tara': {
                en: `The boy is associated with ${boyVal} tara while the girl belongs to ${girlVal} tara. This affects destiny and health compatibility.`,
                hi: `लड़का ${boyVal} तारा से जुड़ा है जबकि लड़की ${girlVal} तारा की है। यह भाग्य को प्रभावित करता है।`
            },
            'Yoni': {
                en: `The boy belongs to ${boyVal} yoni and the girl belongs to ${girlVal} yoni. This indicates physical and sexual compatibility.`,
                hi: `लड़का ${boyVal} योनि का है और लड़की ${girlVal} योनि की है। यह शारीरिक अनुकूलता दर्शाता है।`
            },
            'Graha Maitri': {
                en: `The boy belongs to the rasi lord ${boyVal} and the girl belongs to ${girlVal}'s lordship. This shows mental compatibility and friendship.`,
                hi: `लड़का राशि स्वामी ${boyVal} का है और लड़की ${girlVal} की है। यह मानसिक अनुकूलता दर्शाता है।`
            },
            'Gana': {
                en: `The boy's gan is ${boyVal} and the girl comes under ${girlVal} gan. This determines temperament and behavior compatibility.`,
                hi: `लड़के का गण ${boyVal} है और लड़की ${girlVal} गण की है। यह स्वभाव अनुकूलता निर्धारित करता है।`
            },
            'Bhakoot': {
                en: `The boy belongs to Zodiac sign ${boyVal} while the girl belongs to ${girlVal} sign. This affects love and prosperity.`,
                hi: `लड़का राशि ${boyVal} का है जबकि लड़की ${girlVal} राशि की है। यह प्रेम को प्रभावित करता है।`
            },
            'Nadi': {
                en: `The boy belongs to ${boyVal} and the girl belongs to ${girlVal} nadi. This is crucial for health and progeny.`,
                hi: `लड़का ${boyVal} नाड़ी का है और लड़की ${girlVal} नाड़ी की है। यह स्वास्थ्य के लिए महत्वपूर्ण है।`
            }
        };

        return interpretations[gunaName] || { en: detail.description, hi: detail.description };
    };

    return (
        <div className="space-y-8">
            {/* Birth Details Table */}
            <Card className="p-8 bg-card/40 backdrop-blur-xl border-border rounded-[2.5rem]">
                <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-tighter">
                    {language === 'en' ? 'Birth Details of Boy and Girl' : 'लड़के और लड़की का जन्म विवरण'}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'No.' : 'क्र.'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Name' : 'नाम'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Date / Time' : 'तिथि / समय'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Place' : 'स्थान'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Longitude' : 'देशांतर'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Latitude' : 'अक्षांश'}</th>
                                <th className="text-left p-3 font-black text-foreground">{language === 'en' ? 'Time Zone' : 'समय क्षेत्र'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border/50">
                                <td className="p-3">
                                    <span className="font-bold text-primary">1</span>
                                </td>
                                <td className="p-3">
                                    <span className="font-bold text-primary">{language === 'en' ? 'Boy' : 'लड़का'}</span>
                                    <br />
                                    <span className="text-muted-foreground">{boyData.name}</span>
                                </td>
                                <td className="p-3 text-muted-foreground">
                                    {boyData.date}<br />{boyData.time}
                                </td>
                                <td className="p-3 text-muted-foreground">{boyData.place}</td>
                                <td className="p-3 text-muted-foreground">{boyData.longitudeStr}</td>
                                <td className="p-3 text-muted-foreground">{boyData.latitudeStr}</td>
                                <td className="p-3 text-muted-foreground">5.5</td>
                            </tr>
                            <tr>
                                <td className="p-3">
                                    <span className="font-bold text-primary">2</span>
                                </td>
                                <td className="p-3">
                                    <span className="font-bold text-primary">{language === 'en' ? 'Girl' : 'लड़की'}</span>
                                    <br />
                                    <span className="text-muted-foreground">{girlData.name}</span>
                                </td>
                                <td className="p-3 text-muted-foreground">
                                    {girlData.date}<br />{girlData.time}
                                </td>
                                <td className="p-3 text-muted-foreground">{girlData.place}</td>
                                <td className="p-3 text-muted-foreground">{girlData.longitudeStr}</td>
                                <td className="p-3 text-muted-foreground">{girlData.latitudeStr}</td>
                                <td className="p-3 text-muted-foreground">5.5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Guna Milan Table */}
            <Card className="p-8 bg-card/40 backdrop-blur-xl border-border rounded-[2.5rem]">
                <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-tighter">
                    {language === 'en' ? 'Guna Milan' : 'गुण मिलान'}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left p-3 font-black">{language === 'en' ? 'No.' : 'क्र.'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Guna' : 'गुण'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Boy' : 'लड़का'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Girl' : 'लड़की'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Maximum' : 'अधिकतम'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Obtained' : 'प्राप्त'}</th>
                                <th className="text-left p-3 font-black">{language === 'en' ? 'Area Of Life' : 'जीवन क्षेत्र'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matchResult.details && matchResult.details.map((detail: any, index: number) => (
                                <tr key={index} className="border-b border-border/50">
                                    <td className="p-3 font-bold text-primary">{index + 1}</td>
                                    <td className="p-3 font-bold text-foreground">{detail.name.split('(')[0].trim()}</td>
                                    <td className="p-3 text-muted-foreground">{detail.boyValue || '-'}</td>
                                    <td className="p-3 text-muted-foreground">{detail.girlValue || '-'}</td>
                                    <td className="p-3 text-muted-foreground">{detail.maxScore}</td>
                                    <td className="p-3 font-bold text-primary">{detail.score}</td>
                                    <td className="p-3 text-muted-foreground text-xs">{detail.areaOfLife || detail.description}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Matching Results Summary */}
            <Card className="p-8 bg-primary/10 border-primary/20 rounded-[2.5rem]">
                <h2 className="text-2xl font-black text-foreground mb-4 uppercase tracking-tighter">
                    {language === 'en' ? 'Horoscope Matching Results' : 'कुंडली मिलान परिणाम'}
                </h2>
                <div className="space-y-4">
                    <p className="text-lg font-bold text-foreground">
                        {language === 'en' ? 'Ashtakoot Matching between boy and girl is' : 'लड़के और लड़की के बीच अष्टकूट मिलान'} <span className="text-primary text-2xl">{matchResult.totalScore}/36</span>
                    </p>

                    {matchResult.mangalDosha && (
                        <p className="text-muted-foreground">
                            {language === 'en' ? `Mr. ${boyData.name} has '${matchResult.mangalDosha.boy}' and Ms. ${girlData.name} has '${matchResult.mangalDosha.girl}'`
                                : `श्री ${boyData.name} में '${matchResult.mangalDosha.boy}' है और सुश्री ${girlData.name} में '${matchResult.mangalDosha.girl}' है`}
                        </p>
                    )}

                    <div className="p-4 bg-background/50 rounded-2xl">
                        <p className="font-bold text-foreground mb-2">
                            {language === 'en' ? 'Conclusion:' : 'निष्कर्ष:'}
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            {matchResult.recommendation}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Detailed Interpretations */}
            <Card className="p-8 bg-card/40 backdrop-blur-xl border-border rounded-[2.5rem]">
                <h2 className="text-2xl font-black text-foreground mb-6 uppercase tracking-tighter">
                    {language === 'en' ? 'Interpretation' : 'व्याख्या'}
                </h2>
                <div className="space-y-6">
                    {matchResult.details && matchResult.details.map((detail: any, index: number) => {
                        const interpretation = getInterpretation(detail);

                        return (
                            <div key={index} className="p-6 bg-background/50 rounded-2xl border border-border">
                                <h3 className="text-lg font-black text-primary mb-3">{detail.name}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {language === 'en' ? interpretation.en : interpretation.hi}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
