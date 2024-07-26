# CProgAggregator

## Tasks
### Week 4
- [x] Set up project structure
- [x] Create Prisma schema and database
- [x] Set up API endpoints fetching both user and question stats from Codeforces
- [x] Implement GitHub OAuth and persistent login

### Week 5
- [x] Create basic profile page UI
- [x] Process the questions from Codeforces
- [x] Create linking method to link user account to website
- [x] Create submission stats (attempts, AC, percentages)

### Week 6
- [x] Implement the question suggestion algorithm (should adjust the estimated Elo on whether a user can solve it and their attempts)
- [x] Add problem refresh
- [x] Suggestion Problems - Implement topic targetted & Elo targetted
- [x] Get started with BullMQ task schedulers to constantly update information of users and questions if data is too old (updating every day)

### Week 7
- [x] Finish task schedulers if necessary
- [x] Create a questions list with Elo, topic tags, and link them to said questions. Implement search, sorts, and filters. Update status of question if solved
- [x] Get started with resources board

### Week 8
- [x] Finish the resources board if necessary
- [x] Implement general page, listing upcoming and previous contests.
- [x] STRETCH: Visualize user stats with graphs via a graph library
- [x] Add refresh button to profile, fetching latest data. Has to work with task schedulers as to not spam Codeforces API

### Week 9
- [x] Implement "couldn't solve", storing the questions the user has failed to solve in the past
- [ ] Implement the creation of a username, updating resources board with author name.
- [x] Implement public profile pages, allowing for foreign users to see a user's public stats (total solved/submissions and their graphs)
