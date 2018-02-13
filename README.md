# count-scriptlets
A Node.js Utility that counts the lines of scriptlet code in JSPs.

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
