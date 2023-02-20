"use strict";

const TableRepo = require("../persistence/table_repo");

class Create {
  /**
   * Create constructor
   * @param {TableRepo} repository
   */
  constructor(repository) {
    this.repository = repository;
  }

  async execute(ids) {
    let registries = await this.repository.getBatch(ids);
    console.table(registries);
    return registries;
  }
}

module.exports = Create;
