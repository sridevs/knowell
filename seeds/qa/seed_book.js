exports.seed = function (knex, Promise) {
    return knex('transaction').del()
        .then(() => {
            return knex('book').del()
        })
        .then(() => {
            return knex('title').del()
        })
        .then(() => {
            return knex('title').insert([
                {
                    "title": "How to Solve it by Computer",
                    "isbn": 9788131705629,
                    "author": "Dromey",
                    "publisher": "Pearson Education India",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/How_to_Solve_it_by_Computer.jpg",
                    "pages": 442,
                    "description": "this book talks about the problems solved by computer"
                },
                {
                    "title": "Fish!",
                    "isbn": 9780340819807,

                    "author": "Stephen C. Lundin,Harry Paul,Harry W. Paul,John Christensen",
                    "publisher": "Coronet",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/Fish%21.jpg",
                    "pages": 112,
                    "description": "A parable that helps you love the work you do - even if you can't always do work that you love."
                },
                {
                    "title": "Frindle",
                    "isbn": 9780689818769,

                    "author": "Andrew Clements",
                    "publisher": "Atheneum Books for Young Readers",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/Frindle.jpg",
                    "pages": 112,
                    "description": "From bestselling and award-winning author Andrew Clements, a quirky, imaginative tale about creative thought and the power of words that will have readers inventing their own words. Is Nick Allen a troublemaker? He really just likes to liven things up at school -- and he's always had plenty of great ideas. When Nick learns some interesting information about how words are created, suddenly he's got the inspiration for his best plan ever...the frindle. Who says a pen has to be called a pen? Why not call it a frindle? Things begin innocently enough as Nick gets his friends to use the new word. Then other people in town start saying frindle. Soon the school is in an uproar, and Nick has become a local hero. His teacher wants Nick to put an end to all this nonsense, but the funny thing is frindle doesn't belong to Nick anymore. The new word is spreading across the country, and there's nothing Nick can do to stop it."
                },
                {
                    "title": "A Prisoner of Birth",
                    "isbn": 9780330464062,

                    "author": "Jeffrey Archer",
                    "publisher": "Pan Macmillan",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/A_Prisoner_of_Birth.jpg",
                    "pages": 615,
                    "description": "Danny Cartwright and Spencer Craig were born on different sides of the track. Danny, an East End Cockney, leaves Clement Attlee Comprehensive School at the age of 15 to take up a job at a local garage. He falls in love with Beth, the boss's daughter, and asks her to marry him. Spencer Craig resides in the West End. A graduate of an English public school and Cambridge University. After leaving university he becomes a criminal barrister and is soon tipped to be the youngest Queen's Counsel of his generation. Danny and Beth travel up to the West End to celebrate their engagement. They end the evening in a wine bar where Spencer Craig is also celebrating - his 30th birthday, along with a select group of university chums. Although the two young men don't meet, their lives will never be the same again. For, an hour later, one of them is arrested for murder, while the other ends up as the Prosecution's chief witness in an Old Bailey trial."
                },
                {
                    "title": "Dictionary Of Anthropology",
                    "isbn": 9781449397814,

                    "author": "Norman Lewis",
                    "publisher": "",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/Dictionary_Of_Anthropology.jpg",
                    "pages": 693,
                    "description": ""
                },
                {
                    "title": "Statistics in a Nutshell",
                    "isbn": 9781449397814,

                    "author": "Sarah Boslaugh,Dr. Paul Andrew Watters",
                    "publisher": "\"O'Reilly Media, Inc.\"",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/Statistics_in_a_Nutshell.jpg",
                    "pages": 480,
                    "description": "Need to learn statistics as part of your job, or want some help passing a statistics course? Statistics in a Nutshell is a clear and concise introduction and reference that's perfect for anyone with no previous background in the subject. This book gives you a solid understanding of statistics without being too simple, yet without the numbing complexity of most college texts. You get a firm grasp of the fundamentals and a hands-on understanding of how to apply them before moving on to the more advanced material that follows. Each chapter presents you with easy-to-follow descriptions illustrated by graphics, formulas, and plenty of solved examples. Before you know it, you'll learn to apply statistical reasoning and statistical techniques, from basic concepts of probability and hypothesis testing to multivariate analysis. Organized into four distinct sections, Statistics in a Nutshell offers you: Introductory material: Different ways to think about statistics Basic concepts of measurement and probability theory Data management for statistical analysis Research design and experimental design How to critique statistics presented by others Basic inferential statistics: Basic concepts of inferential statistics The concept of correlation, when it is and is not an appropriate measure of association Dichotomous and categorical data The distinction between parametric and nonparametric statistics Advanced inferential techniques: The General Linear Model Analysis of Variance (ANOVA) and MANOVA Multiple linear regression Specialized techniques: Business and quality improvement statistics Medical and public health statistics Educational and psychological statistics Unlike many introductory books on the subject, Statistics in a Nutshell doesn't omit important material in an effort to dumb it down. And this book is far more practical than most college texts, which tend to over-emphasize calculation without teaching you when and how to apply different statistical tests. With Statistics in a Nutshell, you learn how to perform most common statistical analyses, and understand statistical techniques presented in research articles. If you need to know how to use a wide range of statistical techniques without getting in over your head, this is the book you want."
                },
                {
                    "title": "The One Minute Manager",
                    "isbn": 9788172234997,

                    "author": "Kenneth H. Blanchard,Spencer Johnson",
                    "publisher": "",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/The_One_Minute_Manager.jpg",
                    "pages": 111,
                    "description": "Details a simple, yet effective management system based on three fundamental strategies for earning raises, promotions, and power in business."
                },
                {
                    "title": "The Ugly Truth",
                    "isbn": 9780141331980,

                    "author": "Jeff Kinney",
                    "publisher": "Puffin Books",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/The_Ugly_Truth.jpg",
                    "pages": 217,
                    "description": "Greg Heffley navigates his way through family and school life with his best friend, Rowley."
                },
                {
                    "title": "The Secret Seven",
                    "isbn": 9781444913439,

                    "author": "Enid Blyton,Tony Ross",
                    "publisher": "Hodder & Stoughton",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/The_Secret_Seven.jpg",
                    "pages": 117,
                    "description": "The Secret Seven are Peter and his sister Janet, Jack, Colin, George, Pam and Barbara. They meet every holiday in the shed at the bottom of Peter and Janet's garden - and solve mysteries, and eat lots of delicious food. But no one can enter the shed without whispering the secret password! There are 15 Secret Seven novels, and a collection of short stories. In their first adventure, the gang are dressed in disguise, following a lead to a spooky old house in the snow . . . Each book features rarely seen bonus Blyton: extra stories, a quiz, additional artwork and insights into Blyton's life and writing process."
                },
                {
                    "title": "The Case of the Bonsai Manager",
                    "isbn": 9780670081318,

                    "author": "R. Gopalakrishnan",
                    "publisher": "Penguin Portfolio",
                    "thumbnailURL": "https://res.cloudinary.com/drgtxp7jf/image/upload/v1496844917/The_Case_of_the_Bonsai_Manager.jpg",
                    "pages": 264,
                    "description": "No One Sets Out To Become A Bonsai Manager, Just As No Plant Is Created By Nature To Be A Bonsai. Managers Growth Can Be Stunted By Their Own Acts Of Omission And Commission Instead, They Should Branch Out In New Directions Drawing On Their Innate Genius. Where Two Circles Nature And Management Intersect, Intuitive Leadership Is Born. Using Anecdotes About A Vast Array Of Living Creatures, And His Own Experiences In The World Of Business, The Author Nudges Managers Towards Letting Their Gut Instinct Speak When Faced With Difficult Decisions. Intuition Will Be A Key Differentiator For Excellence In The Future, More Than In The Past. Why, When Imported Into China From Thailand, Did Crocodiles Lose Their Sex Drive? What Was The Purpose Behind The Arab Bonding With His Falcon All Day Long? How Do Squirrel Gangs Scare Off Snakes? Why Are Grizzly Bear Cubs Trained For Two Years To Hook Salmon? There Is A Management Lesson In Each Endearing Story From The Animal Kingdom. Drawing On Insights From A Rich Management Career Spanning Forty Years, This Book Gives An Idea Of The Basic Characteristics Of Human Nature, The Complexities Of Employee Behaviour Within Organizations And How An Agenda For Change Can Be Charted Out. This Is Essential Because Future Managers Will Face Vastly Different Challenges As The World Around Them Changes Dramatically. In This World, The Inclusive, Intuitive And Humane Style Of Management Will Work, Not The Top-Down Approach And Here Is An Author Uniquely Placed To Tell Us How."
                }
            ])
        })
        .then(() => {
            return knex('book').insert([
                {title_id: 1, tag_number: '1-1', available: 1, id: 1},
                {title_id: 1, tag_number: '1-2', available: 1, id: 2},
                {title_id: 2, tag_number: '2-1', available: 1, id: 3},
                {title_id: 2, tag_number: '2-2', available: 1, id: 4},
                {title_id: 2, tag_number: '2-3', available: 1, id: 5},
                {title_id: 2, tag_number: '2-4', available: 1, id: 6},
                {title_id: 3, tag_number: '3-1', available: 1, id: 7},
                {title_id: 4, tag_number: '4-1', available: 1, id: 8},
                {title_id: 4, tag_number: '4-2', available: 1, id: 9},
                {title_id: 4, tag_number: '4-3', available: 1, id: 10},
                {title_id: 4, tag_number: '4-4', available: 1, id: 11},
                {title_id: 5, tag_number: '5-1', available: 1, id: 12},
                {title_id: 6, tag_number: '6-1', available: 1, id: 13},
                {title_id: 6, tag_number: '6-2', available: 1, id: 14},
                {title_id: 6, tag_number: '6-3', available: 1, id: 15},
                {title_id: 7, tag_number: '7-1', available: 1, id: 16},
                {title_id: 7, tag_number: '7-2', available: 1, id: 17},
                {title_id: 7, tag_number: '7-3', available: 1, id: 18},
                {title_id: 7, tag_number: '7-4', available: 1, id: 19},
                {title_id: 8, tag_number: '8-1', available: 1, id: 20},
                {title_id: 8, tag_number: '8-2', available: 1, id: 21},
                {title_id: 8, tag_number: '8-3', available: 1, id: 22},
                {title_id: 8, tag_number: '8-4', available: 1, id: 23},
                {title_id: 8, tag_number: '8-5', available: 1, id: 24},
                {title_id: 9, tag_number: '9-1', available: 1, id: 25},
                {title_id: 9, tag_number: '9-2', available: 1, id: 26},
                {title_id: 9, tag_number: '9-3', available: 1, id: 27},
                {title_id: 9, tag_number: '9-4', available: 1, id: 28},
                {title_id: 10, tag_number: '10-1', available: 1, id: 29},
                {title_id: 10, tag_number: '10-2', available: 1, id: 30}
            ])
        }).then(() => {
            return knex('user').insert([
                {
                    "email": "borrower@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false
                },
                {
                    "email": "librarian@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": false
                },
                {
                    "email": "admin@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": false,
                    "isLibrarian": false,
                    "isAdmin": true
                }, {
                    "email": "sitaram@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false
                },
                {
                    "email": "sayanbi@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": false
                },
                {
                    "email": "supriyag@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false
                },
                {
                    "email": "spreeti@thoughtworks.com",
                    "isBorrower": true,
                    "enabled": true,
                    "isLibrarian": true,
                    "isAdmin": true
                },
                {
                    "email": "vharidas@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true

                },
                {
                    "email": "lalitpan@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true
                },
                {
                    "email": "abhishet@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false,
                },
                {
                    "email": "sumand@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false,

                },
                {
                    "email": "jitendrs@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": false,
                },
                {
                    "email": "syanima@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true,
                },
                {
                    "email": "basava@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false,
                },
                {
                    "email": "mitesh@thoughtworks.com ",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false,
                },
                {
                    "email": "jishnu@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true

                },
                {
                    "email": "madhuri@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true,
                },
                {
                    "email": "brindaba@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false
                },
                {
                    "email": "nabeel@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": false

                },
                {
                    "email": "sagarma@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true,

                },
                {
                    "email": "srijays@thoughtworks.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": true
                }


            ])
        });
};
