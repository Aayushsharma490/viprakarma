import { createHash } from 'crypto';

/**
 * Generate unique palmistry predictions based on image data
 * Uses image hash to ensure consistent but varied results for different images
 */
export function generatePalmistryPredictions(imageData: string) {
    // Create hash from image data
    const hash = createHash('md5').update(imageData.substring(0, 10000)).digest('hex');
    const seed = parseInt(hash.substring(0, 8), 16);

    const variants = {
        lifeLine: {
            lengths: ['Long and deep', 'Medium length', 'Short but clear', 'Extended and curved'],
            depths: ['Deep and prominent', 'Moderately deep', 'Light but visible', 'Very deep'],
            clarities: ['Crystal clear', 'Slightly broken', 'Clear with branches', 'Continuous'],
            meanings: [
                'Indicates strong vitality and robust health throughout life',
                'Shows balanced energy and steady life progression',
                'Suggests dynamic life with significant changes',
                'Reflects resilient constitution and longevity'
            ],
            predictions: [
                ['Long and healthy life ahead', 'Strong immunity system', 'Active lifestyle benefits', 'Good recovery from illnesses'],
                ['Balanced health patterns', 'Moderate energy levels', 'Steady life progression', 'Consistent vitality'],
                ['Dynamic life changes', 'Adaptable health', 'Variable energy patterns', 'Resilient nature'],
                ['Exceptional longevity', 'Robust constitution', 'High energy reserves', 'Quick healing abilities']
            ]
        },
        heartLine: {
            shapes: ['Curved upward', 'Straight across', 'Gently sloping', 'Deep curve'],
            positions: ['High on palm', 'Middle position', 'Close to fingers', 'Near head line'],
            meanings: [
                'Indicates passionate and expressive emotional nature',
                'Shows balanced and stable relationships',
                'Suggests deep emotional connections',
                'Reflects strong romantic tendencies'
            ],
            predictions: [
                ['Deep romantic connections', 'Passionate relationships', 'Emotional fulfillment', 'Strong family bonds'],
                ['Stable partnerships', 'Balanced emotions', 'Harmonious relationships', 'Loyal nature'],
                ['Intense emotional experiences', 'Meaningful connections', 'Devoted partner', 'Strong empathy'],
                ['Multiple significant relationships', 'Emotional growth', 'Compassionate nature', 'Lasting love']
            ]
        },
        headLine: {
            clarities: ['Very clear', 'Slightly wavy', 'Straight and deep', 'Forked ending'],
            lengths: ['Long and extended', 'Medium length', 'Short but clear', 'Reaching edge'],
            meanings: [
                'Shows analytical and logical thinking abilities',
                'Indicates creative and imaginative mind',
                'Suggests practical and grounded approach',
                'Reflects balanced intellectual capabilities'
            ],
            predictions: [
                ['Excellent problem-solving skills', 'Analytical career success', 'Strategic thinking', 'Logical decision-making'],
                ['Creative pursuits flourish', 'Innovative ideas', 'Artistic talents', 'Imaginative solutions'],
                ['Practical achievements', 'Grounded decisions', 'Business acumen', 'Common sense prevails'],
                ['Balanced intellect', 'Versatile thinking', 'Adaptable mind', 'Continuous learning']
            ]
        },
        fateLine: {
            presences: ['Strong and clear', 'Faint but visible', 'Multiple lines', 'Deep and prominent'],
            positions: ['Center of palm', 'Towards thumb', 'Near life line', 'Straight upward'],
            meanings: [
                'Indicates strong career path and professional success',
                'Shows self-made success and determination',
                'Suggests multiple career opportunities',
                'Reflects steady professional growth'
            ],
            predictions: [
                ['Career advancement ahead', 'Professional recognition', 'Leadership opportunities', 'Financial stability'],
                ['Self-made success', 'Entrepreneurial ventures', 'Independent achievements', 'Personal milestones'],
                ['Multiple income sources', 'Diverse opportunities', 'Career changes', 'Versatile skills'],
                ['Steady career growth', 'Consistent progress', 'Long-term success', 'Professional stability']
            ]
        }
    };

    const lifeIdx = seed % 4;
    const heartIdx = (seed * 2) % 4;
    const headIdx = (seed * 3) % 4;
    const fateIdx = (seed * 5) % 4;

    return {
        lifeLine: {
            length: variants.lifeLine.lengths[lifeIdx],
            depth: variants.lifeLine.depths[lifeIdx],
            clarity: variants.lifeLine.clarities[lifeIdx],
            meaning: variants.lifeLine.meanings[lifeIdx],
            predictions: variants.lifeLine.predictions[lifeIdx],
        },
        heartLine: {
            shape: variants.heartLine.shapes[heartIdx],
            position: variants.heartLine.positions[heartIdx],
            clarity: 'Clear',
            meaning: variants.heartLine.meanings[heartIdx],
            predictions: variants.heartLine.predictions[heartIdx],
        },
        headLine: {
            clarity: variants.headLine.clarities[headIdx],
            length: variants.headLine.lengths[headIdx],
            curve: 'Moderate',
            meaning: variants.headLine.meanings[headIdx],
            predictions: variants.headLine.predictions[headIdx],
        },
        fateLine: {
            presence: variants.fateLine.presences[fateIdx],
            clarity: 'Visible',
            position: variants.fateLine.positions[fateIdx],
            meaning: variants.fateLine.meanings[fateIdx],
            predictions: variants.fateLine.predictions[fateIdx],
        },
        mounts: {
            jupiter: {
                prominence: seed % 2 === 0 ? 'Well developed' : 'Moderately developed',
                meaning: seed % 2 === 0 ? 'Leadership and ambition' : 'Balanced authority'
            },
            saturn: {
                prominence: (seed * 2) % 2 === 0 ? 'Prominent' : 'Average',
                meaning: (seed * 2) % 2 === 0 ? 'Discipline and responsibility' : 'Balanced approach'
            },
            apollo: {
                prominence: (seed * 3) % 2 === 0 ? 'Well formed' : 'Moderate',
                meaning: (seed * 3) % 2 === 0 ? 'Creativity and success' : 'Artistic inclinations'
            },
            mercury: {
                prominence: (seed * 5) % 2 === 0 ? 'Developed' : 'Average',
                meaning: (seed * 5) % 2 === 0 ? 'Communication skills' : 'Business aptitude'
            },
            venus: {
                prominence: (seed * 7) % 2 === 0 ? 'Full and rounded' : 'Well developed',
                meaning: (seed * 7) % 2 === 0 ? 'Love and passion' : 'Warmth and affection'
            },
            luna: {
                prominence: (seed * 11) % 2 === 0 ? 'Prominent' : 'Moderate',
                meaning: (seed * 11) % 2 === 0 ? 'Imagination and intuition' : 'Creative instincts'
            },
        },
        fingerAnalysis: {
            thumb: seed % 3 === 0 ? 'Strong willpower' : seed % 3 === 1 ? 'Balanced determination' : 'Flexible approach',
            index: seed % 3 === 0 ? 'Leadership qualities' : seed % 3 === 1 ? 'Confident nature' : 'Ambitious spirit',
            middle: seed % 3 === 0 ? 'Responsible and serious' : seed % 3 === 1 ? 'Balanced outlook' : 'Practical wisdom',
            ring: seed % 3 === 0 ? 'Creative and artistic' : seed % 3 === 1 ? 'Appreciation for beauty' : 'Expressive nature',
            pinky: seed % 3 === 0 ? 'Excellent communication' : seed % 3 === 1 ? 'Business minded' : 'Persuasive abilities',
        },
        specialMarks: [
            { type: seed % 2 === 0 ? 'Star on Jupiter mount' : 'Triangle on Apollo', meaning: seed % 2 === 0 ? 'Success and recognition' : 'Creative achievements' },
            { type: (seed * 2) % 2 === 0 ? 'Triangle on fate line' : 'Square on life line', meaning: (seed * 2) % 2 === 0 ? 'Career breakthrough' : 'Protection and safety' },
            { type: (seed * 3) % 2 === 0 ? 'Clear money line' : 'Fish symbol', meaning: (seed * 3) % 2 === 0 ? 'Financial prosperity' : 'Good fortune' },
        ],
        overall: `Your palm reveals a ${seed % 2 === 0 ? 'dynamic and ambitious' : 'balanced and harmonious'} personality with ${(seed * 2) % 2 === 0 ? 'strong leadership potential' : 'excellent creative abilities'}. The combination of your major lines suggests ${(seed * 3) % 2 === 0 ? 'significant career success' : 'fulfilling personal relationships'} and ${(seed * 5) % 2 === 0 ? 'financial stability' : 'emotional fulfillment'} in the coming years.`,
        recommendations: [
            seed % 4 === 0 ? 'Focus on career development and professional growth' : seed % 4 === 1 ? 'Nurture personal relationships and emotional bonds' : seed % 4 === 2 ? 'Pursue creative and artistic endeavors' : 'Balance work and personal life',
            (seed * 2) % 4 === 0 ? 'Practice meditation for mental clarity' : (seed * 2) % 4 === 1 ? 'Engage in physical activities for vitality' : (seed * 2) % 4 === 2 ? 'Develop communication skills' : 'Cultivate financial discipline',
            (seed * 3) % 4 === 0 ? 'Take calculated risks in business' : (seed * 3) % 4 === 1 ? 'Strengthen family connections' : (seed * 3) % 4 === 2 ? 'Explore new learning opportunities' : 'Build strong professional networks',
            (seed * 5) % 4 === 0 ? 'Trust your intuition in decisions' : (seed * 5) % 4 === 1 ? 'Maintain work-life balance' : (seed * 5) % 4 === 2 ? 'Invest in personal development' : 'Practice gratitude and mindfulness',
            (seed * 7) % 4 === 0 ? 'Embrace leadership opportunities' : (seed * 7) % 4 === 1 ? 'Foster creative expression' : (seed * 7) % 4 === 2 ? 'Build financial security' : 'Cultivate emotional intelligence',
        ],
    };
}
