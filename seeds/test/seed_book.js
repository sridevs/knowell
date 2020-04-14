exports.seed = function (knex, Promise) {
    return knex('transaction').del()
        .then(() => {
            return knex('book').del()
        })
        .then(() => {
            return knex('title').del()
        })
        .then(() => {
            return knex('user').del()
        })
        .then(() => {
            return knex('title').insert([
                {id: 1, title: 'Javascript', isbn: '678910', author: 'ACB', publisher: 'AK publisher',thumbnailURL: 'http://sampleurl/image.jpg',pages:20,description: 'Description'},
                {id: 2, title: 'Java', isbn: '678910', author: 'EFG', publisher: 'PK publisher',thumbnailURL: 'http://sampleurl/image.jpg',pages:20,description: 'Description'},
                {id: 3, title: 'Scala', isbn: '5678910', author: 'LMN', publisher: 'AA publisher',thumbnailURL: 'http://sampleurl/image.jpg',pages:20,description: 'Description'}
            ])
        })
        .then(() => {
            return knex('book').insert([
                {id: 1, title_id: 1, tag_number: '1-1', available: 0},
                {id: 2, title_id: 1, tag_number: '1-2', available: 1},
                {id: 3, title_id: 2, tag_number: '2-3', available: 0},
                {id: 4, title_id: 3, tag_number: '3-4', available: 1},
                {id: 5, title_id: 3, tag_number: '3-5', available: 1},
            ])
        })
        .then(() => {
            return knex('user').insert([
                {
                    "id": 1,
                    "email": "admin@domain.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": false,
                    "isAdmin": true
                },
                {
                    "id": 2,
                    "email": "librarian@domain.com",
                    "enabled": true,
                    "isBorrower": true,
                    "isLibrarian": true,
                    "isAdmin": false
                },
                {
                    id: 3,
                    email: "disabled@domain.com",
                    enabled: false,
                    isBorrower: true,
                    isLibrarian: true,
                    isAdmin: false
                }

            ])
        })
        .then(() => {
            return knex('transaction').insert([
                {
                    id: 1,
                    book_id: 1,
                    user_id: 1,
                    borrow_date: new Date("05 27, 2017 16:53:58"),
                    return_date: null,
                    issue_by: 1,
                    return_by: null
                },
                {
                    id: 2,
                    book_id: 3,
                    user_id: 2,
                    borrow_date: new Date("05 27, 2017 16:53:57"),
                    return_date: null,
                    issue_by: 2,
                    return_by: null
                }
            ])
        });
};
