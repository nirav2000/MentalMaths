# Mental Math Expansion Module

Version 2.0.0

## Overview

This expansion module extends the existing Mental Math application to include comprehensive addition and subtraction fact fluency training, plus a progressive number sense system that takes users from foundational single-digit facts all the way to solving multi-digit problems and word problems using multiple mental math strategies.

## Module Structure

### Module A: Addition & Subtraction Facts
- **10 Addition Strategies**: From counting on to bridge through 10
- **10 Subtraction Strategies**: From counting back to same difference
- **Fact Mastery Tracking**: Individual tracking for all facts (0-12)
- **Strategy-Based Teaching**: Facts grouped and taught by strategy
- **Inverse Linking**: Automatic connection between addition and subtraction

### Module B: Progressive Number Application
- **7 Progression Levels**: Single-digit through four-digit and word problems
- **6 Mental Math Methods**: Partitioning, sequencing, compensation, and more
- **Method Selection**: Choose your preferred solving strategy
- **Multi-Strategy View**: See the same problem solved multiple ways
- **Adaptive Difficulty**: Problems adjust to user performance

## File Structure

```
expansion/
├── css/
│   ├── expansion-main.css      # Core styles
│   ├── facts.css               # Placeholder for fact practice styles
│   ├── methods.css             # Placeholder for method selection styles
│   ├── visuals.css             # Placeholder for visualization styles
│   ├── progress.css            # Placeholder for progress dashboard styles
│   └── remediation.css         # Placeholder for diagnostic/remediation styles
├── js/
│   ├── expansion-app.js        # Main app entry point and router
│   ├── expansion-config.js     # Constants, thresholds, strategies, methods
│   ├── expansion-utils.js      # Shared helper functions
│   └── data/
│       ├── expansion-storage.js # localStorage wrapper for user data
│       └── data-models.js       # Data structure factory functions
├── expansion.html              # Standalone HTML page
└── README.md                   # This file
```

## Key Features

### Mastery Levels
- **Learning**: < 60% accuracy OR > 10s response time
- **Developing**: 60-79% accuracy OR 5-10s response time
- **Secure**: 80-94% accuracy AND 3-5s response time
- **Fluent**: 95%+ accuracy AND < 3s response time

### Colour Coding
- Fluent: Deep green (#2E7D32)
- Secure: Light green (#66BB6A)
- Developing: Amber (#FFB74D)
- Learning: Light red (#EF5350)
- Locked: Grey (#BDBDBD)

### Strategy-Based Learning
Facts are taught in teaching order, with each strategy building on previous ones. Users cannot skip ahead - strategies unlock only when prerequisites are mastered.

### Multi-Method Approach
For larger numbers, users can:
1. Choose their preferred method
2. See step-by-step breakdowns
3. Compare multiple methods side-by-side
4. Learn which method works best for different problem types

## Integration

This module is designed to be:
- **Self-contained**: All expansion code lives in the `expansion/` folder
- **Standalone**: Can be accessed via `expansion.html` directly
- **Embeddable**: Can be iframed or linked from the main app
- **Firebase-compatible**: Data structure supports Firebase sync (future)

## Data Storage

User progress is stored in localStorage under the key `mentalMathExpansion`. The data structure includes:
- Individual fact mastery records
- Strategy group progress
- Level completion status
- Method proficiency
- Session history
- Diagnostic results

## Future Development

This is Prompt 1 of 20 in the expansion implementation. Future prompts will add:
- Fact practice screens
- Diagnostic quiz engine
- Visual illustration system
- Method implementation
- Remediation units
- Word problem engine
- Progress dashboard

## Usage

### Standalone Access
Open `expansion/expansion.html` in a web browser.

### From Main App
Link to `expansion/expansion.html` from the main app navigation.

### Development
All JavaScript uses ES6 modules. No build step is required - files can be edited and refreshed directly in the browser.

## Design Principles

1. **ES6 Modular Architecture**: 100-150 lines max per file
2. **Incremental Mastery**: Prerequisites must be met before unlocking
3. **Show Your Working**: All intermediate steps displayed
4. **Diagnose Before Drill**: Identify what's misunderstood first
5. **Multiple Strategies**: Users can see and select different methods
6. **Visual First**: Pictorial explanations for concrete understanding

## License

This module is part of the Mental Math application.
