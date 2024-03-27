const { replaceOne } = require("../model/ProductsModel");

class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  search() {
    const keyword = this.queryStr.keyword
      ? {
          title: {
            $regex: this.queryStr.keyword,
            $options: "i",
          },
        }
      : {};

    this.query = this.query.find({ ...keyword });

    return this;
  }

  filter() {
    const queryCopy = { ...this.queryStr };

    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete queryCopy[key]);

    const data = {};

    Object.entries(queryCopy).forEach(([key, value]) => {
      if (typeof value === "object" && Object.keys(value).length > 0) {
        const nestedData = {};

        Object.entries(value).forEach(([operator, val]) => {
          nestedData[operator === "eq" ? key : `$${operator}`] = val;
        });

        data[key] = nestedData;
      } else {
        if (value !== "" && value !== null && value !== undefined) {
          data[key] = value;
        }
      }
    });

    this.query = this.query.find(data);

    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }
}

module.exports = ApiFeatures;
