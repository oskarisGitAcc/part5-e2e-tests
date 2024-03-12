describe('Blog app', function() {
  beforeEach(function() {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user1 = {
      name: 'root',
      username: 'Superuser',
      password: 'salainen'
    }
    const user2 = {
      name: 'Oskari',
      username: 'pyykkoo1',
      password: 'password'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user1)
    cy.request('POST', 'http://localhost:3003/api/users/', user2)
    cy.visit('http://localhost:5173')
  })

  it('Login form is shown', function() {
    cy.contains('Log in to application')
  })

  describe('Login', function() {
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

    describe('and a blog exists', function() {
      beforeEach(function() {
        cy.createBlog({
          title: 'a blog created by cypress',
          author: 'cypress',
          url: 'https://docs.cypress.io',
          likes: 0
        })
      })

      it('users can like a blog', function() {
        cy.contains('a blog created by cypress')
          .parent().find('button').contains('View').click()
        cy.contains('Like').click()
        cy.contains('Likes: 1')
      })

      it('user who created a blog can delete it', function() {
        cy.contains('a blog created by cypress')
          .parent().find('button').contains('View').click()
        cy.contains('Remove').click()
        cy.contains('a blog created by cypress').should('not.exist')
      })

      it('user who did not create the blog, cannot delete it', function() {
        cy.contains('logout').click()
        cy.login({ username: 'pyykkoo1', password: 'password' })
        cy.contains('a blog created by cypress')
          .parent().find('button').contains('View').click()
        cy.contains('Remove').should('not.exist')
      })

      it('Blogs are ordered by likes', function() {
        cy.createBlog({
          title: 'Blog with 3 likes',
          author: 'Author',
          url: 'https://docs.cypress.io',
          likes: 3
        })
        cy.createBlog({
          title: 'Blog with 1 like',
          author: 'Author',
          url: 'https://docs.cypress.io',
          likes: 1
        })
        cy.createBlog({
          title: 'Blog with 2 likes',
          author: 'Author',
          url: 'https://docs.cypress.io',
          likes: 2
        })

        cy.contains('Blog with 2 likes')
          .parent().find('button').contains('View').click()
        cy.contains('Blog with 2 likes')
          .parent().find('button').contains('Like').click()
        cy.contains('Blog with 2 likes')
          .parent().find('button').contains('Like').click()
        cy.contains('Blog with 1 like')
          .parent().find('button').contains('View').click()
        cy.contains('Blog with 1 like')
          .parent().find('button').contains('Like').click()

        cy.get('.blog').eq(0)
          .should('contain', 'Blog with 2 likes')
        cy.get('.blog').eq(1)
          .should('contain', 'Blog with 3 likes')
        cy.get('.blog').eq(2)
          .should('contain', 'Blog with 1 like')
      })
    })
  })
})
