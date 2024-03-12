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
      cy.request('POST', 'http://localhost:3003/api/login', {
        username: 'Superuser', password: 'salainen'
      }).then(response => {
        localStorage.setItem('loggedBlogappUser', JSON.stringify(response.body))
        cy.visit('http://localhost:5173')
        cy.contains('root logged in')
      })
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
        localStorage.setItem('loggedBlogappUser', JSON.stringify(response.body))
        cy.visit('http://localhost:5173')
        expect(response.status).to.eq(401)
        cy.contains('root logged in').should('not.exist')
      })
    })

  })
})
