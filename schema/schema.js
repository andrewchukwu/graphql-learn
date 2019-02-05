const graphql = require('graphql');
const _ = require('lodash');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;


const CompanyType = new GraphQLObjectType({
    name: 'Company',
    fields: () => ({
        id: { type: GraphQLString },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        users: {
            type: new GraphQLList(UserType),
            resolve(parentValue, args) {
                console.log(parentValue, args);
                return axios.get(`http://localhost:3000/companies/${ parentValue.id }/users`)
                    .then(res => res.data)
            }
        }
    })
});
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLString },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                console.log(parentValue, args);
                return axios.get(`http://localhost:3000/companies/${ parentValue.companyId }`)
                    .then(res => res.data)
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    //define root queries - where we can begin querying from
    fields: {
        user: {
            type: UserType, //model
            args: { id: { type: GraphQLString } },  //identifying column

            resolve(parentValue, args) {
                //Resolve expects a Promise to be returned
                //return _.find(users, { id: args.id }); //get the data
                return axios.get(`http://localhost:3000/users/${ args.id }`) //data: {Your data.....}
                    .then(response => response.data)
            }
        },
        company: {
            type: CompanyType,
            args: { id: { type: GraphQLString } },  //identifying column
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${ args.id }`) //data: {Your data.....}
                    .then(response => response.data)
            }
        }
    }
});

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType, //type of data that will return from the mutation
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString },
            },
            resolve(parentValue, args) {
                return axios.post('http://localhost:3000/users',{ args}) 
                    .then(response => response.data)
            }
        }
    }
});

module.exports = new GraphQLSchema({
    mutation:mutation,
    query: RootQuery,
})




