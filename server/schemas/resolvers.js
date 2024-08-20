const fs = require('fs');
const { OpenAI } = require('openai');
const path = require('path');


// Initialize the OpenAI client with your API Key
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.ORG_ID,
    project: process.env.PROJ_ID
});

const resolvers = {
    Query: {
        user: async (parent, args, context) => {
            if (context.user) {
                const user = await User.findById(context.user._id);
                return user;
            }
            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const token = signToken(user);
            return { token, user };
        },
        updateUser: async (parent, args, context) => {
            if (context.user) {
                return await User.findByIdAndUpdate(context.user._id, args, { new: true });
            }
            throw new AuthenticationError('Not logged in');
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const token = signToken(user);
            return { token, user };
        },
        getAnswer: async (_, { question }) => {
            try {
                const assistantId = process.env.ASST_ID; // Replace with your actual Assistant ID
                const vectorStoreId = 'vs_NsdSYVwDlFvekKALI9wwbNth'; // Replace with your actual Vector Store ID


                // Create a thread with the user's question
                const thread = await openai.beta.threads.create();

                console.log(thread)

                const message = await openai.beta.threads.messages.create(
                    thread.id,
                    {
                        role: "user",
                        content: question
                    }
                );
                console.log(message)

                const run = await openai.beta.threads.runs.createAndPoll(
                    thread.id,
                    { assistant_id: assistantId }
                );
                console.log(run)

                let res = '';
                if (run.status === 'completed') {
                    const messages = await openai.beta.threads.messages.list(
                        run.thread_id
                    );
                    for (const message of messages.data.reverse()) {
                        console.log(`${message.role} > ${message.content[0].text.value}`);
                        res += message.content[0].text.value + '  \n'
                    }
                } else {
                    console.log(run.status);
                }

                return res;

            } catch (error) {
                console.error('Error fetching answer from OpenAI:', error);
                throw new Error('Failed to fetch response from OpenAI API');
            }
        }
    }
};

module.exports = resolvers;
