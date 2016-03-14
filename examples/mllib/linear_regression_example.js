/*
 * Copyright 2016 IBM Corp.
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

/*
 Usage:
 bin/eclairjs.sh examples/mllib/linear_regression_example.js"
 */

function run(sc) {

    var data = sc.textFile("examples/data/lpsa.data").cache();
    var parsedData = data.map(function (s) {
        var parts = s.split(",");
        var features = parts[1].split(" ");
        return new LabeledPoint(parts[0], new DenseVector(features));
    });

    var numIterations = 3;
    var linearRegressionModel = LinearRegressionWithSGD.train(parsedData, numIterations);

    var delta = 17;
    var valuesAndPreds = parsedData.mapToPair(function (lp, linearRegressionModel, delta) {
        var label = lp.getLabel();
        var f = lp.getFeatures();
        var prediction = linearRegressionModel.predict(f) + delta;
        return new Tuple(prediction, label);
    }, [linearRegressionModel, delta]); // end MapToPair

    return  valuesAndPreds.take(10);


}

/*
 check if SparkContext is defined, if it is we are being run from Unit Test
 */

if (typeof sparkContext === 'undefined') {

    var sparkConf = new SparkConf().setAppName("Linear Regression Example").setMaster("local[*]");
    var sc = new SparkContext(sparkConf);
    var result = run(sc);
    print("valuesAndPreds: " + result.toString());

    sc.stop();
}
