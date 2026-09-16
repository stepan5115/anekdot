CREATE TABLE jokes (
    id BIGSERIAL PRIMARY KEY,
    text VARCHAR(2000) NOT NULL,
    category VARCHAR(50) NOT NULL,
    author VARCHAR(100) NOT NULL DEFAULT 'Народное',
    published_at DATE NOT NULL,
    absurdity_level INTEGER NOT NULL CHECK (absurdity_level BETWEEN 1 AND 10),
    adult BOOLEAN NOT NULL DEFAULT FALSE,
    likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    dislikes INTEGER NOT NULL DEFAULT 0 CHECK (dislikes >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jokes (text, category, author, published_at, absurdity_level, adult, likes, dislikes) VALUES
('Программист поставил чайник, ушёл компилировать проект и вернулся через три спринта.', 'IT', 'Народное', '2025-01-12', 6, FALSE, 14, 2),
('Почему дедлайн называется дедлайном? Потому что после него проект начинает жить своей жизнью.', 'Работа', 'Офисный фольклор', '2025-02-03', 5, FALSE, 21, 4),
('Кот сел на клавиатуру и написал код. Тимлид попросил его провести ревью остальной команды.', 'Коты', 'Народное', '2025-03-18', 8, FALSE, 34, 1),
('Купил умный холодильник. Теперь он не открывается после шести и говорит: «Мы же договаривались».', 'Быт', 'Народное', '2025-04-07', 7, FALSE, 18, 3),
('На собеседовании спросили о моих слабых сторонах. Я ответил: «SQL». Они уточнили: «Насколько?» — «SELECT слабые_стороны FROM меня».', 'IT', 'Народное', '2025-05-22', 9, FALSE, 42, 5),
('Улитка зашла в бар. Бармен говорит: «Мы улиток не обслуживаем», — и выбрасывает её. Через год улитка возвращается: «Ну и зачем ты это сделал?»', 'Абсурд', 'Классика', '2025-06-10', 10, FALSE, 55, 7);

