class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = {
            ...this.queryString
        };

        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);

        // Use regex to check for the gte, lte, lt, gt in the querystring
        // and append $ in before for mongoDB purpose
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            // If sort by multiple fields, need to remove , from req query and use ' '
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            // This will allow to query only to return the requested fields
            this.query = this.query.select(fields);
        } else {
            // If no fields are requested, we will still remove the below field,
            // As its not needed in response
            // '-' means exclude it
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        // eg) page = 2
        const page = this.queryString.page * 1 || 1;

        // limit - 10
        const limit = this.queryString.limit * 1 || 100;

        // skip = 2-1 * 10 = skips the first 10 records
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;