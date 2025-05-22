import React, { useState } from 'react';

const LuckyDraw = ({ maxNumber = 8, walletAmount = 1000 }) => {
  const [chosenNumber, setChosenNumber] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [winningNumber, setWinningNumber] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [message, setMessage] = useState('');
  const [boardRotation, setBoardRotation] = useState(0);
  const [dartRotation, setDartRotation] = useState(0);
  const [gameResult, setGameResult] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateDartRotation = (number) => {
    if (!number || number < 1 || number > maxNumber) return 0;
    return (360 / maxNumber) * (number - 1);
  };

  const handleNumberChange = (value) => {
    setChosenNumber(value);
    if (value && !isSpinning) {
      const rotation = calculateDartRotation(parseInt(value));
      setDartRotation(rotation);
    }
  };

  const handleSpin = async () => {
    if (!chosenNumber || chosenNumber < 1 || chosenNumber > maxNumber) {
      setMessage(`Please enter a valid number between 1 and ${maxNumber}`);
      return;
    }

    const betValue = parseFloat(betAmount);
    if (!betValue || isNaN(betValue) || betValue <= 0) {
      setMessage('Please enter a valid bet amount');
      return;
    }

    if (betValue > walletAmount) {
      setMessage('Insufficient wallet balance');
      return;
    }

    setIsSpinning(true);
    setMessage('');
    setGameResult(null);

    const randomSpin = 360 * 5;
    setBoardRotation(randomSpin);
    setDartRotation(calculateDartRotation(parseInt(chosenNumber)));

    try {
      const response = await fetch('/lucky-draw/spin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chosen_number: parseInt(chosenNumber),
          bet_amount: betValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTimeout(() => {
          setWinningNumber(data.winning_number);

          setGameResult({
            won: data.is_winner,
            betAmount: data.bet_amount,
            finalAmount: data.final_amount
          });

          setMessage(data.message);

          const finalBoardRotation = randomSpin + (360 / maxNumber) * (maxNumber - data.winning_number);
          setBoardRotation(finalBoardRotation);
          setDartRotation(calculateDartRotation(data.winning_number));
          setIsSpinning(false);
        }, 2000);
      } else {
        throw new Error(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage(error.message || 'An error occurred. Please try again.');
      setIsSpinning(false);
      setBoardRotation(0);
      setDartRotation(calculateDartRotation(parseInt(chosenNumber)));
    }
  };

  const resetGame = () => {
    setChosenNumber('');
    setBetAmount('');
    setWinningNumber(null);
    setMessage('');
    setGameResult(null);
    setBoardRotation(0);
    setDartRotation(0);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 bg-green-100 border border-green-400 rounded-lg p-3 shadow-md z-10">
        <p className="text-sm font-medium text-green-800">
          Wallet: {formatCurrency(walletAmount || 0)}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center mb-6 text-gray-800">Lucky Draw Dartboard</h1>

        <div className="relative w-72 h-72 mx-auto mb-8">
          <div
            className="rounded-full w-full h-full bg-gray-800 shadow-inner flex items-center justify-center relative overflow-hidden border-4 border-yellow-500"
            style={{
              transform: `rotate(${boardRotation}deg)`,
              transition: isSpinning ? 'transform 2s ease-out' : 'none',
            }}
          >
            {[...Array(maxNumber)].map((_, i) => {
              const angle = (i * 360) / maxNumber;
              const isRed = i % 2 === 0;

              return (
                <div
                  key={i}
                  className="absolute w-full h-full"
                  style={{
                    clipPath: `polygon(50% 50%, ${50 + 45 * Math.cos((angle - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((angle - 90) * Math.PI / 180)}%, ${50 + 45 * Math.cos((angle + 360 / maxNumber - 90) * Math.PI / 180)}% ${50 + 45 * Math.sin((angle + 360 / maxNumber - 90) * Math.PI / 180)}%)`,
                  }}
                >
                  <div className={`w-full h-full ${isRed ? 'bg-red-600' : 'bg-gray-900'}`} />
                </div>
              );
            })}

            {[...Array(maxNumber)].map((_, i) => {
              const angle = (i * 360) / maxNumber;
              const radius = 110;
              const x = 50 + (radius / 144) * 50 * Math.cos((angle - 90) * Math.PI / 180);
              const y = 50 + (radius / 144) * 50 * Math.sin((angle - 90) * Math.PI / 180);
              const isSelected = parseInt(chosenNumber) === (i + 1);

              return (
                <div
                  key={`number-${i}`}
                  className="absolute w-8 h-8 flex items-center justify-center"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <span className={`font-bold text-lg drop-shadow-lg ${isSelected ? 'text-yellow-300 text-xl' : 'text-white'}`}>
                    {i + 1}
                  </span>
                </div>
              );
            })}

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-gray-800 shadow-lg"></div>
            </div>
          </div>

          <div
            className="absolute top-0 left-1/2 w-1 h-20 bg-gradient-to-b from-yellow-400 to-yellow-600 transform -translate-x-1/2 origin-bottom"
            style={{
              transform: `translateX(-50%) rotate(${dartRotation}deg)`,
              transition: isSpinning ? 'transform 2s ease-out' : 'transform 0.3s ease-in-out',
              transformOrigin: '50% 144px',
            }}
          >
            <div className="w-3 h-3 bg-red-600 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2 shadow-lg"></div>
            <div className="w-1 h-16 bg-gray-700 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
          </div>
        </div>

        {/* Inputs */}
        <div className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a number (1-{maxNumber})
            </label>
            <input
              type="number"
              value={chosenNumber}
              onChange={(e) => handleNumberChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              min="1"
              max={maxNumber}
              disabled={isSpinning}
              placeholder={`Enter 1-${maxNumber}`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount (₹)
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
              min="1"
              disabled={isSpinning}
              placeholder="Enter your bet amount"
            />
            {betAmount && !isNaN(parseFloat(betAmount)) && parseFloat(betAmount) > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                Win: {formatCurrency(parseFloat(betAmount) * 2)} | Lose: ₹0
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSpin}
            className={`flex-1 py-3 px-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors shadow-md ${
              isSpinning ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSpinning}
          >
            {isSpinning ? 'Spinning...' : 'Throw the Dart!'}
          </button>

          {winningNumber && (
            <button
              onClick={resetGame}
              className="py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-md"
            >
              New Game
            </button>
          )}
        </div>

        {/* Result */}
        {message && (
          <div className="mt-6 text-center">
            <p className={`text-lg font-semibold ${
              message.includes('Congratulations') ? 'text-green-600' : 'text-red-600'
            }`}>
              {message}
            </p>

            {winningNumber && (
              <p className="text-sm text-gray-600 mt-2">
                The dart landed on: <span className="font-bold">{winningNumber}</span>
              </p>
            )}

            {gameResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Your bet: {formatCurrency(gameResult.betAmount)}</p>
                  <p>Your number: <span className="font-semibold">{chosenNumber}</span></p>
                  <p>Winning number: <span className="font-semibold">{winningNumber}</span></p>
                </div>
                <div className={`text-xl font-bold mt-2 ${
                  gameResult.won ? 'text-green-600' : 'text-red-600'
                }`}>
                  {gameResult.won ? 
                    `You won ${formatCurrency(gameResult.finalAmount)}! 🎉` : 
                    'You lost your bet 😔'
                  }
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LuckyDraw;
