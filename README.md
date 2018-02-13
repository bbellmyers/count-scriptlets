# count-scriptlets
A Node.js Utility that counts the lines of scriptlet code in JSPs.

This can be used as an analysis tool on large JSP codebases to find the largest scriptlets, to help focus refactoring efforts.

A scriptlet is defined narrowly to only include lines bounded by <% %>.  JSP expressions <%= %> are not counted as scriptlets, nor are JSP comments <%-- --%>.  All other JSP syntax is also permitted and not included in the scriptlet count.

Install globally:
```
npm install -g
```

If you run it without arguments, it recursively finds all JSPs and JSPFs from the current directory.

If you add the optional --file argument, it runs only on that one file.

Output is compatible with the CSV format, so you can capture to a file to import into Excel.
```
count-scriptlets > my-results.csv
```

Sample output:
```
FileName                                                              , original , scriptlet , percent
xml\SystemProperty.jsp                                                ,       52 ,        29 , 56%
xml\ViewXml.jsp                                                       ,      209 ,        54 , 26%
xml\XmlController.jsp                                                 ,      119 ,        82 , 69%
                                                                      ,--------- , --------- , -------
TOTAL                                                                 ,      380 ,       165 , 43%
```
