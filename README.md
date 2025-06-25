# 🚀 Speed Typing Game

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow)

Welcome to the **Speed Typing Game**, a web-based application designed to test and improve your typing speed in a fun and interactive way. This game challenges players to type out given paragraphs within a set time limit while tracking speed (words per minute), accuracy, and mistakes. The game uses a random set of Hedera-related paragraphs to keep the content fresh and engaging.

## 🎮 How to Play

1. Start typing the displayed paragraph in the input field as accurately and quickly as possible.
2. Keep an eye on the timer, your typing speed (WPM), and your accuracy (CPM) as you type.
3. Once the time is up or the paragraph is completed, your final speed, accuracy, and the number of mistakes will be displayed. You'll be prompted to enter your name to save your score.
4. After entering your name, you can view your score and the leaderboard.
5. The game will also display your rank based on your performance compared to other players. When you click the link on the rank, it will take you to the Hedera Hashscan page for the topic where your score is recorded.

### Setup

1. **Topic ID:** Before we can run the game, make sure to create a new topic ID on the Hedera testnet and replace at `server.js` line 15: `const topicId = "<id>";` with your new topic ID.

2. **Hedera Account:** Ensure you have a Hedera account set up with testnet credentials. You can create an account on the [Hedera Portal](https://portal.hedera.com/). Make sure to use the ECDSA private key for your account.

Fill out your OPERATOR KEY and OPERATOR ID in the `.env` file. You can copy the `.env.example` file to `.env` and fill in your details:

```sh
cp .env.example .env
```

Content of `.env` file should look like this:

```
OPERATOR_ID=your_operator_id
OPERATOR_KEY=your_operator_key (ECDSA private key)
```

3. **Install Dependencies:** Make sure you have Node.js installed on your machine. Then, install the required dependencies by running:

```sh
npm install
```

4. **Start the Server:** Run the server using the following command:

```sh
node server.js
```

Upon starting the server, it will sync with the Hedera topic and fetch all messages to repopulate the leaderboard. So it's safe to turn off and on the server as needed.

5. **Open the Game:** Open your web browser and navigate to `http://localhost:3000/game/index.html` to start playing the Speed Typing Game. The leaaderboard can be accessed at `http://localhost:3000/game/leaderboard.html`.

6. **Booth Mode:** At conferences, you can run the game in one tab (`game/index.html`) and the leaderboard in another tab (`game/leaderboard.html`). This allows you to have a booth where people can play the game and see their scores in real-time. The leaderboard will automatically update every 2.5 seconds.


## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

This code is an open-source project based of KDvs123's Typing Test. You can find the original project and contribute to it on the GitHub repository:: https://github.com/KDvs123/Typing-Test.git

If you have any questions, suggestions, or issues, feel free to open an issue on the repository.