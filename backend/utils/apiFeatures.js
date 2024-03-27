class APIFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }
  //Serach function anything
  search() {
    let keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword, //serch monogodb
            $options: "i", //case insensitive
          },
        }
      : {};
    this.query.find({ ...keyword });
    return this;
  }
  //category fillter function

  filter() {
    const queryStrCopy = { ...this.queryStr };
    //before
    // console.log(queryStrCopy);
    // //{ keyword: 'Campus', category: 'Sports' }

    //removing fields from query
    const removeFields = ["keyword", "limit", "page"]; //pagnation

    removeFields.forEach((field) => delete queryStrCopy[field]);

    // //after
    // console.log(queryStrCopy);
    // //{ category: 'Sports' }

    let queryStr = JSON.stringify(queryStrCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)/g, (match) => `$${match}`); //giveing doller siniging

    // console.log(queryStrCopy);
    // { price: { $lt: '500' }, '$price': { $gt: '1000' } } lt gt menasqury oprator

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  paginate(resPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPage * (currentPage - 1);
    this.query.limit(resPage).skip(skip);
    return this;
  }
}

module.exports = APIFeatures;
