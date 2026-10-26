/**
 * Curated Multiple-Choice Questions (MCQ) Bank for SQL Knowledge Assessment
 * Covers Basic SQL, Joins, Aggregations, Indexing, Transactions, and Performance Tuning.
 */
export const MCQ_QUESTIONS = [
  {
    id: 'mcq_1',
    category: 'Basic SQL',
    question: 'Which SQL clause is used to filter records resulting from a GROUP BY aggregation?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'],
    correctAnswer: 1,
    explanation: 'The HAVING clause filters aggregated groups produced by GROUP BY, whereas WHERE filters individual rows before grouping.'
  },
  {
    id: 'mcq_2',
    category: 'Joins',
    question: 'What is the result of an INNER JOIN between two tables when a row in table A has no matching key in table B?',
    options: [
      'The row from table A is included with NULL values for table B columns',
      'The row from table A is completely excluded from the result set',
      'An error is thrown by the database engine',
      'The row from table A is matched with all rows of table B'
    ],
    correctAnswer: 1,
    explanation: 'INNER JOIN returns only rows where matching keys exist in both joined tables. Unmatched rows are omitted.'
  },
  {
    id: 'mcq_3',
    category: 'Window Functions',
    question: 'How does DENSE_RANK() differ from RANK() in SQL window functions?',
    options: [
      'DENSE_RANK() assigns sequential ranks without gaps for tied values, while RANK() leaves gaps',
      'DENSE_RANK() only works on integer columns, whereas RANK() works on text',
      'RANK() sorts in ascending order only, whereas DENSE_RANK() sorts descending',
      'There is no functional difference between the two'
    ],
    correctAnswer: 0,
    explanation: 'If two rows tie for 1st place, RANK() gives 1, 1, 3 for the next item, while DENSE_RANK() gives 1, 1, 2 without skipping numbers.'
  },
  {
    id: 'mcq_4',
    category: 'Indexing & Performance',
    question: 'Which of the following operations prevents a B-Tree index on a column from being utilized effectively in a WHERE clause?',
    options: [
      'WHERE status = "ACTIVE"',
      'WHERE UPPER(last_name) = "SMITH" (without a functional index)',
      'WHERE created_at >= "2025-01-01"',
      'WHERE id IN (1, 2, 3)'
    ],
    correctAnswer: 1,
    explanation: 'Wrapping an indexed column inside a function like UPPER() or SUBSTR() prevents index lookup unless a function-based index exists.'
  },
  {
    id: 'mcq_5',
    category: 'Transactions',
    question: 'Which ACID property guarantees that all operations within a transaction either succeed completely or roll back entirely?',
    options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
    correctAnswer: 0,
    explanation: 'Atomicity enforces the "all or nothing" principle for transactions.'
  },
  {
    id: 'mcq_6',
    category: 'Subqueries',
    question: 'What occurs if an IN (subquery) encounters a NULL value in the returned subquery result set and the outer value is not in the list?',
    options: [
      'It evaluates to TRUE',
      'It evaluates to FALSE',
      'It evaluates to UNKNOWN / NULL',
      'The query aborts with a runtime exception'
    ],
    correctAnswer: 2,
    explanation: 'In three-valued SQL logic, comparing with NULL yields UNKNOWN. Especially with NOT IN, having a NULL in the subquery causes the entire condition to never evaluate to TRUE.'
  },
  {
    id: 'mcq_7',
    category: 'Constraints',
    question: 'What is the primary difference between a PRIMARY KEY and a UNIQUE constraint?',
    options: [
      'A table can have multiple PRIMARY KEYs, but only one UNIQUE constraint',
      'A PRIMARY KEY cannot accept NULL values, while UNIQUE columns may accept NULLs',
      'UNIQUE constraints cannot be indexed',
      'PRIMARY KEY cannot reference foreign keys'
    ],
    correctAnswer: 1,
    explanation: 'A table can have only one PRIMARY KEY which strictly forbids NULLs. UNIQUE constraints allow one or more NULL values depending on the SQL dialect.'
  },
  {
    id: 'mcq_8',
    category: 'Aggregation',
    question: 'What will COUNT(column_name) return if every row in the table contains a NULL value for that column?',
    options: ['1', 'NULL', '0', 'An error'],
    correctAnswer: 2,
    explanation: 'COUNT(column_name) excludes NULL values and counts only non-null occurrences, returning 0.'
  },
  {
    id: 'mcq_9',
    category: 'Security',
    question: 'Which mechanism is the most effective defense against SQL Injection (SQLi) attacks?',
    options: [
      'Filtering client inputs with regex on the frontend',
      'Prepared statements with parameterized queries',
      'Encoding strings to base64 before storing',
      'Using only GET requests instead of POST'
    ],
    correctAnswer: 1,
    explanation: 'Prepared statements separate SQL code from user data, ensuring input parameters are treated strictly as literal values rather than executable code.'
  },
  {
    id: 'mcq_10',
    category: 'CTEs & Subqueries',
    question: 'What SQL keyword is used to declare a Common Table Expression (CTE)?',
    options: ['AS', 'WITH', 'DECLARE', 'LET'],
    correctAnswer: 1,
    explanation: 'The WITH keyword initiates a Common Table Expression (e.g., WITH RegionalSales AS (SELECT ...)).'
  },
  {
    id: 'mcq_11',
    category: 'Joins',
    question: 'Which type of JOIN returns all records from both tables, filling in NULLs where keys do not match?',
    options: ['LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN', 'FULL OUTER JOIN'],
    correctAnswer: 3,
    explanation: 'FULL OUTER JOIN combines the results of both LEFT and RIGHT outer joins.'
  },
  {
    id: 'mcq_12',
    category: 'Basic SQL',
    question: 'Which operator is used for pattern matching using wildcard characters (% and _) in SQL?',
    options: ['CONTAINS', 'LIKE', 'MATCHES', 'SIMILAR'],
    correctAnswer: 1,
    explanation: 'The LIKE operator is standard SQL for wildcard matching (% matches any number of characters, _ matches a single character).'
  }
];
