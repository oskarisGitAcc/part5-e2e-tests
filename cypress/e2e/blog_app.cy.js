describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'root',
      username: 'Superuser',
      password: 'salainen'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:5173')
  })

  it('Login form is shown', function() {
    cy.contains('Log in to application')
  })

  describe('Login',function() {
    it('succeeds with correct credentials', function() {
      cy.login({ username: 'Superuser', password: 'salainen' })
      cy.contains('root logged in')
    })

    it('fails with wrong credentials', function() {
      cy.request({
        method: 'POST',
        url: 'http://localhost:3003/api/login',
        failOnStatusCode: false,
        body: {
          username: 'nonExistingUser',
          password: 'salainen'
        }
      }).then(response => {
        expect(response.status).to.eq(401)
        cy.contains('root logged in').should('not.exist')
      })
    })
  })

  describe('When logged in', function() {
    beforeEach(function() {
      cy.login({ username: 'Superuser', password: 'salainen' })
    })

    it('A blog can be created', function() {
      cy.contains('Create new blog').click()
      cy.get('#blogTitle').type('a blog created by cypress')
      cy.get('#blogAuthor').type('cypress')
      cy.get('#blogUrl').type('https://docs.cypress.io')
      cy.contains('create').click()
      cy.contains('a blog created by cypress')
    })

    describe('and a blog exists', function () {
      beforeEach(function () {
        cy.createBlog({
          title: 'a blog created by cypress',
          author: 'cypress',
          url: 'https://docs.cypress.io',
          likes: 0
        })
      })

      it('users can like a blog', function() {
        cy.contains('a blog created by cypress').parent().find('button').click()
        cy.contains('Like').click()
        cy.contains('Likes: 1')
      })
    })
  })
})
