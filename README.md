# 🚀 Speed Typing Game

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

Welcome to the **Speed Typing Game**, a web-based application designed to test and improve your typing speed in a fun and interactive way. Built with HTML, CSS, and JavaScript, this game challenges players to type out given paragraphs within a set time limit while tracking speed (words per minute), accuracy, and mistakes.

## 🎮 How to Play

1. Start typing the displayed paragraph in the input field as accurately and quickly as possible.
2. Keep an eye on the timer, your typing speed (WPM), and your accuracy (CPM) as you type.
3. Once the time is up or the paragraph is completed, your final speed, accuracy, and the number of mistakes will be displayed.
4. Click the "Try Again" button to reset the game and try a different paragraph.

### Setup

Before we can run the game, make sure to execute the `topicCreate/script.js` file to generate the necessary topic for the game:

```sh
cd topicCreate
npm install
node script.js
```

// WHEN CHANGING TOPIC ID, makes ure to also change it in the index.html file:
Line 69: <p><strong>Rank: <a href="https://hashscan.io/testnet/topic/0.0.6219486" target="_blank"><span id="modalRank">0</span></a></strong></p>


Timer starts at 60 seconds and counts down to 0. The game ends when the timer reaches 0 or when the player finishes typing the paragraph.
Check the timer in the index.html file to adjust the time limit as needed.

**Then copy the Topic ID from the console output and paste it into the `main.js` file at line 1: `const topicId = "<id>"`.**

### 🔧 Installation

1. **Clone the repository:**
    ```sh
    git clone https://github.com/KDvs123/Typing-Test.git
    cd speed-typing-game
    ```

2. **Open the `index.html` file in your preferred web browser.**

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

Open Source repository by KDvs123: https://github.com/KDvs123/Typing-Test.git

For any questions or suggestions, feel free to reach out:

- 📧 Email: vihangasupasan2001@gmail.com
- 🐙 GitHub: [KDvs123](https://github.com/KDvs123)

Enjoy improving your typing skills with the Speed Typing Game! 🚀✨
