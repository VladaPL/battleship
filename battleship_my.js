// объект представление овечает за обновление озображения
var view = {
  displayMessage: function (msg) {
    var messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function (location) {
    var cell = document.getElementById(location); //получаем ссылку на элемент
    cell.setAttribute("class", "hit"); // добавляем класс hit с помощью метода setAttr
  },
  displayMiss: function (location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  },
};

//объект модель отвечает за хранение состояния игры (позиции кораблей и попаданий)

/*boardSize размер игрового поля
numShips количество кораблей
ships позиции кораблей и координаты попаданий
shipsSunk количество потопленных
shipLength длина корабля в клетках
fire метод выстрела и проверка попадания или промаха*/

var model = {
  boardSize: 7,
  numShips: 3,
  shipsSunk: 0,
  shipLength: 3,
  ships: [
    { locations: ["0", "0", "0"], hits: ["", "", ""] }, // location - клетки занимаемые кораблем
    { locations: ["0", "0", "0"], hits: ["", "", ""] }, // "" заменяется на "hit", когда попадание
    { locations: ["0", "0", "0"], hits: ["", "", ""] },
  ],
  fire: function (guess) {
    //метод получает координаты выстрела. например А0
    for (var i = 0; i < this.numShips; i++) {
      // перебираем массив ships проверяя каждый корабль
      var ship = this.ships[i]; //проверяем занимает ли какой-либо корабль введенное значение А0
      var index = ship.locations.indexOf(guess); // indexOf ищет в массиве guess и указывает его индекс
      if (index >= 0) {
        ship.hits[index] = "hit"; // ставим отметку в массиве hits по найденному индексу
        view.displayHit(guess); //добавляем картинку корабля в клетку
        view.displayMessage("HIT!"); // выводим сообщение Попал
        if (this.isSunk(ship)) {
          //если выстрел удачный
          view.displayMessage("You sank my battleship!"); // выводим эту фразу
          this.shipsSunk++; // и добавляем 1 к количеству потопленных кораблей
        }
        return true; // возвращаем true тк выстрел удачный
      }
    }
    view.displayMiss(guess); // если выстрел неудачный, то miss,
    view.displayMessage("You missed."); // тогда выводим это сообщение
    return false;
  },
  isSunk: function (ship) {
    // метод получает объек корабля
    for (var i = 0; i < this.shipLength; i++) {
      // делает проверку (перебирает)
      if (ship.hits[i] !== "hit") {
        // помечены ли все клетки индикатором 'hit'
        return false; // если хотя бы одна клетка не помечена, то False (корабль не потоплен)
      }
    }
    return true; // Иначе, корабль потоплен! Метод возвращает true
  },

  generateShipLocations: function () {
    // метод создает в модели массив ships
    var locations;
    for (var i = 0; i < this.numShips; i++) {
      // количество кораблей определяется свойством numShip
      do {
        // цикл do while
        locations = this.generateShip(); // генерируется новые позиции
      } while (this.collision(locations)); // проверка перекрытий корабля
      this.ships[i].locations = locations; // сохранение позиций без перекрытий
    }
  },
  generateShip: function () {
    // метод генерирует позиции кораблей
    var direction = Math.floor(Math.random() * 2); // генерация начальной позиции корабля
    var row, col;
    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize); // если direction ===1, генерируем горизонтальный корабль
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength)); // иначе, direction ===0, генерируем вертикальный
      col = Math.floor(Math.random() * this.boardSize);
    }
    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i)); // позиция горизонтального корабля генерируется и заносится в массив newShipLocations
      } else {
        newShipLocations.push(row + i + "" + col); // позиция вертикального корабля генерируется и заносится в массив newShipLocations
      }
    }
    return newShipLocations; // возвращаем заполненные позиции корабля методу generateShipLocations
  },
  collision: function (locations) {
    // метод проверяет перекрываются ли клетки кораблей
    for (var i = 0; i < this.numShips; i++) {
      // для каждого корабля уже находящегося на поле
      var ship = model.ships[i];
      for (var j = 0; j < locations.length; j++) {
        // пересекаются ли позиции нового корабля с существующими
        if (ship.locations.indexOf(locations[j]) >= 0) {
          // indexOf проверяет, присутствует ли заданная позиция в массиве
          return true;
        }
      }
    }
    return false;
  },
};

function parseGuess(guess) {
  // функция разбора координат выстрела (данные ввода передаются в параметр guess)
  var alphabet = ["A", "B", "C", "D", "E", "F", "G"]; // массив с буквами для преобразования
  if (guess === null || guess.length !== 2) {
    // проверка данных на null и на 2 символа
    alert("Oops, please enter a letter and a number on the board."); // сообщаем, что ввод некорерктен
  } else {
    firstChar = guess.charAt(0); // извлекаем первый символ координат выстрела
    var row = alphabet.indexOf(firstChar); // (Строка) получаем цифру от 0 до 6, соответствующую букве
    var column = guess.charAt(1); // (Стролбец) получаем второй символ из столбца

    if (isNaN(row) || isNaN(column)) {
      // ф-ия проверяет является ли NaN координаты выстрела
      alert("Oops, that isn't on the board.");
    } else if (
      row < 0 ||
      row >= model.boardSize ||
      column < 0 ||
      column >= model.boardSize
    ) {
      // проверяем, что цыфры в диапозоне от 0 до 6
      alert("Oops, that's off the board!");
    } else {
      return row + column; // после всех проверок , метод может вернуть результат
    }
  }
  return null; // если проверка не прошла
}
var controller = {
  // определяется объект контроллера
  guesses: 0, // количество выстрелов - свойство контроллера, инициализируется нулем
  processGuess: function (guess) {
    // вводим метод обработки координат выстрела и передача их модели
    var location = parseGuess(guess);
    if (location) {
      // если метод parseGuess не вернул null, значит получен действительный объект
      this.guesses++; //счетчик выстрелов увеличивается на 1
      var hit = model.fire(location); // комбинация строки и столбца передается методу fire
      if (hit && model.shipsSunk === model.numShips) {
        // если выстрел попал в цель и количество потопленных кораблей равно количеству кораблей в игре
        view.displayMessage(
          "You sank all my battleships, in " + this.guesses + " guesses"
        ); // выводим общее количество выстрелов, которое потребовалось
      }
    }
  },
};
function init() {
  // ф-ия для связи кнопки с обработчиком события
  var fireButton = document.getElementById("fireButton"); // получаем ссылку на кнопку Fire по id
  fireButton.onclick = handleFireButton; // обработчик события нажатия кнопки
  var guessInput = document.getElementById("guessInput"); //обработчик клавиши Enter (Ввод)
  guessInput.onkeypress = handleKeyPress;
  model.generateShipLocations(); /* Метод model.generateShipLocations в объекте модели.
  вызывается из функции init, чтобы
  это происходило во время загрузки игры (до ее начала). При таком
  вызове позиции всех кораблей будут
  определены к моменту начала игры. */
}
function handleFireButton() {
  // ф-ия вызывается при каждом нажатии кнопки
  var guessInput = document.getElementById("guessInput"); // получаем ссылку на элемент формы
  var guess = guessInput.value; // извлекаем данные введенные пользователем
  controller.processGuess(guess); // координаты выстерла передаются контролеру
  guessInput.value = ""; // удаляем содержимое элемента формы
}
window.onload = init; // браузер выполнит ф-ию при полной загрузке страницы
function handleKeyPress(e) {
  // ф-ия для обработки нажатия Enter
  var fireButton = document.getElementById("fireButton");
  if (e.keyCode === 13) {
    fireButton.click();
    return false; // возвращаем false, чтобы форма не делала ничего лишнего
  }
}
