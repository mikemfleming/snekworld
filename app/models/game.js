const mongoose = require('mongoose');

const gameSchema = mongoose.Schema({
	game: {
		player: String,
		score: Number,
	}
});

module.exports = mongoose.model('Game', gameSchema);
