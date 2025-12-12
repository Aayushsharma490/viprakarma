# Kundali Platform - Task Implementation

## Current Task: Fix Birth City Error & Implement North Indian Kundali Chart

### Status: In Progress

### Tasks:
- [ ] Modify astrologyApi.ts to make city optional (remove validation error)
- [ ] Update page.tsx to use NorthIndianKundali component instead of KundaliChart
- [ ] Enhance NorthIndianKundali.tsx for accurate planet positioning within houses
- [ ] Improve chart responsiveness and dynamic scaling
- [ ] Test kundali generation without city parameter
- [ ] Verify North Indian chart renders correctly with proper planet positions

### Files to Edit:
- src/lib/astrologyApi.ts
- src/app/kundali/page.tsx
- src/components/NorthIndianKundali.tsx

### Notes:
- Error occurs when birth city is empty in generateKundali function
- Current chart uses diamond layout, need to switch to traditional North Indian style
- Planets currently positioned on lines instead of proper house positions
- Need to make chart more dynamic and responsive
