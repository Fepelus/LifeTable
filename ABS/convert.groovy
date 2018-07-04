@Grab('com.xlson.groovycsv:groovycsv:1.1')
import static com.xlson.groovycsv.CsvParser.parseCsv

    print "{\"male\":{"
for(line in parseCsv(new FileReader('201416.csv'), columnNames: ['year','mlx','mqx','mLx','mex',,'flx','fqx','fLx','fex'])) {
    println "${line.year}:{\"qx\":${line.mqx},\"ex\":${line.mex}},"
}
    print "},\"female\":{"
for(line in parseCsv(new FileReader('201416.csv'), columnNames: ['year','mlx','mqx','mLx','mex',,'flx','fqx','fLx','fex'])) {
    println "${line.year}:{\"qx\":${line.fqx},\"ex\":${line.fex}},"
}
	println "}}"
 
