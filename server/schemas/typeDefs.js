const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type User {
        _id: ID
        email: String
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        user: User
    }

    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(email: String!, password: String!): Auth
        updateUser(email: String, password: String): User
        getAnswer(question: String): String
    
    }
`
module.exports = typeDefs;

