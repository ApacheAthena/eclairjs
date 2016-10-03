/*
 * Copyright 2015 IBM Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function exit() {
  process.exit();
}

function stop(e) {
  if (e) {
    console.log(e);
  }
  sparkSession.stop().then(exit).catch(exit);
}



function run(sparkSession, spark) {
  return new Promise(function(resolve, reject) {
    // Input data: Each row is a bag of words from a sentence or document.
    var data = [
      spark.sql.RowFactory.create([["a", "b", "c"]]),
      spark.sql.RowFactory.create([["a", "b", "b", "c", "a"]])
    ];

    var schema = new spark.sql.types.StructType([
      new spark.sql.types.StructField("text", new spark.sql.types.ArrayType(spark.sql.types.DataTypes.StringType, true), false, spark.sql.types.Metadata.empty())
    ]);

    var df = sparkSession.createDataFrame(data, schema);

    // fit a CountVectorizerModel from the corpus
    var cvModel = new spark.ml.feature.CountVectorizer()
      .setInputCol("text")
      .setOutputCol("feature")
      .setVocabSize(3)
      .setMinDF(2)
      .fit(df);

    cvModel.transform(df).take(10).then(resolve).catch(stop);
  });
}

if (global.SC) {
  // we are being run as part of a test
  module.exports = run;
} else {
  //var eclairjs = require('../../client/lib');
  var eclairjs = require('eclairjs');
  var spark = new eclairjs();
  var sparkSession = spark.sql.SparkSession
            .builder()
            .appName("Count Vectorizer")
            .getOrCreate();
  run(sparkSession, spark).then(function(results) {
    console.log('Count Vectorizer result', JSON.stringify(results));
    stop();
  }).catch(stop);
}
