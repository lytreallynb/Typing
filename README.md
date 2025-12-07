# Typing Practice Web Application

A modern, feature-rich typing practice web application built with Next.js, TypeScript, and Tailwind CSS. This application helps users learn and improve their touch typing skills with interactive visual guides.

## Features

### Core Features
- **On-screen Keyboard**: Visual keyboard with color-coded keys for each finger
- **Real-time Key Highlighting**: Current key to press is highlighted on the keyboard
- **Animated Hand Guides**: SVG hands show which finger to use for each key
- **Live Typing Feedback**: Characters turn green (correct) or red (incorrect) as you type
- **Comprehensive Stats**: Track WPM, accuracy, error count, and progress
- **Multiple Lessons**: 10 pre-built lessons ranging from beginner to advanced

### Typing Metrics
- **WPM (Words Per Minute)**: Real-time calculation of typing speed
- **Accuracy**: Percentage of correctly typed characters
- **Error Count**: Number of mistakes made
- **Progress**: Visual progress through the current lesson

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatic dark mode based on system preferences
- **Smooth Animations**: Fluid transitions for key presses and finger movements
- **Color-Coded Fingers**: Each finger has a distinct color for easy learning
  - Pink: Pinkies
  - Purple: Ring fingers
  - Blue: Middle fingers
  - Green: Index fingers
  - Gray: Thumbs

## Lesson Types

The application includes various lesson types:

1. **Characters**: Practice individual characters and character combinations
2. **Words**: Type complete words to build muscle memory
3. **Sentences**: Practice with full sentences including punctuation
4. **Mixed**: Combination of letters, numbers, and special characters

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone or download this repository

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## How to Use

1. **Select a Lesson**: Click on any lesson card to load it
2. **Start Typing**: Click on the typing area and begin typing
3. **Watch the Guides**:
   - The keyboard highlights which key to press next
   - The hand display shows which finger to use
   - Characters turn green when correct, red when incorrect
4. **Track Progress**: Monitor your WPM, accuracy, and progress in real-time
5. **Backspace to Correct**: Use Backspace to fix mistakes
6. **Complete the Lesson**: Finish typing all characters to complete the lesson

## Project Structure

```
typing/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Main page component
├── components/
│   ├── Keyboard.tsx          # On-screen keyboard component
│   ├── HandsDisplay.tsx      # SVG hands with finger animations
│   ├── TypingArea.tsx        # Main typing interface
│   ├── StatsDisplay.tsx      # Statistics display
│   └── LessonController.tsx  # Lesson selection interface
├── data/
│   ├── lessons.json          # Lesson content and metadata
│   └── keyboardMapping.json  # Key-to-finger mappings
├── types/
│   └── lesson.ts             # TypeScript type definitions
└── public/                   # Static assets
```

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: React 19
- **SVG Graphics**: Inline SVG for hand animations

## Customization

### Adding New Lessons

Edit `/data/lessons.json` and add a new lesson object:

```json
{
  "id": "lesson-custom",
  "title": "Your Lesson Title",
  "description": "Lesson description",
  "difficulty": "beginner|intermediate|advanced",
  "type": "characters|words|sentences|mixed",
  "content": "The text to type..."
}
```

### Modifying Keyboard Layout

Edit `/data/keyboardMapping.json` to change which finger is used for each key.

### Styling

All components use Tailwind CSS. Modify the classes in component files or extend the theme in `tailwind.config.ts`.

## Future Enhancements (Optional)

- **Backend API**: Store user progress and statistics
- **User Accounts**: Track progress across sessions
- **Leaderboards**: Compare scores with other users
- **Custom Lessons**: Create and share custom typing lessons
- **Typing Games**: Gamify the typing experience
- **Certificate Generation**: Award certificates for completed courses
- **Touch Typing Course**: Structured curriculum for beginners

## Performance

- Built with Next.js for optimal performance
- Client-side rendering for responsive typing experience
- Efficient state management with React hooks
- Smooth 60fps animations using CSS transitions

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
