describe('map viewer page', () =>{
  it('test copy link button', () => {
    cy.visit('/data/maps/scaffold/8b407bfe-e9d6-4a45-a81c-386184beecdd?access=demo1-12L');
    cy.contains('Scaffold Viewer');
    cy.get('.copy-btn').should('contain', 'Copy the link').click();
    cy.contains('copied');
  })

  it('test scaffold is loaded', () => {
    cy.visit('/data/maps/scaffold/8b407bfe-e9d6-4a45-a81c-386184beecdd?access=demo1-12L');
    cy.wait(10000);
    // box in the bottom left corner
    cy.get('.traditional-container').should('contain', 'Regions');
    // content in the box
    cy.get('.el-tree-node__content').should('contain', 'brainstem');
    cy.get('.el-tree-node__content').should('contain', 'midbrain');
    cy.get('.el-popover__reference-wrapper').find('svg');   // icon
    cy.get('canvas');
  })

  it('test flatmap is loaded', () => {
    cy.visit('/data/maps/flatmap/1?access=demo1-12L');
    cy.contains('Flatmap Viewer');
    cy.wait(10000);
    cy.get('.checkall-display-text').should('contain', 'Pathways');
    cy.get('.label-text').should('contain', 'CNS');
    cy.get('canvas');
  })
})