# CProgAggregator

## Tasks
### Week 4
- [x] Set up project structure
- [ ] Create Prisma schema and database
- [ ] Set up API endpoints fetching both user and question stats from Codeforces
- [ ] Implement GitHub OAuth and persistent login

### Week 5
- [ ] Create basic profile page UI
- [ ] Process the questions from Codeforces
- [ ] Create linking method to link user account to website
- [ ] Create submission stats (attempts, AC, percentages)

### Week 6
- [ ] Implement the question suggestion algorithm (should adjust the estimated Elo on whether a user can solve it and their attempts)
- [ ] Add problem refresh
- [ ] Suggestion Problems - Implement topic targetted & Elo targetted
- [ ] Get started with BullMQ task schedulers to constantly update information of users and questions if data is too old (updating every day)

### Week 7
- [ ] Finish task schedulers if necessary
- [ ] Create a questions list with Elo, topic tags, and link them to said questions. Implement search, sorts, and filters. Update status of question if solved
- [ ] Get starteted with resources board

### Week 8
- [ ] Finish the resources board if necessary
- [ ] Implement general page, listing upcoming and previous contests.
- [ ] STRETCH: Visualize user stats with graphs via a graph library
- [ ] Add refresh button to profile, fetching latest data. Has to work with task schedulers as to not spam Codeforces API

### Week 9
- [ ] Implement "couldn't solve", storing the questions the user has failed to solve in the past
- [ ] Implement the creation of a username, updating resources board with author name.
- [ ] Implement public profile pages, allowing for foreign users to see a user's public stats (total solved/submissions and their graphs)