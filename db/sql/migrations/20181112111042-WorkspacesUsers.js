'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('WorkspacesUsers',{
        createdAt:  {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        WorkspaceId: {
            type: Sequelize.UUID,
            primaryKey: true,
        },
        UserId: {
          type: Sequelize.UUID,
          primaryKey: true,
        },
      })
  },

  down: (queryInterface, Sequelize) => {
   return queryInterface.dropTable('ProductTags');
  }
};
