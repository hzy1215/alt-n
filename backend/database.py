import os
import logging
import mysql.connector
from mysql.connector import Error
import traceback

class DatabaseManager:
    def __init__(self):

        self.host = os.getenv('MYSQL_HOST', 'localhost')
        self.user = os.getenv('MYSQL_USER', 'root')
        self.password = os.getenv('MYSQL_PASSWORD', '')
        self.db_name = os.getenv('MYSQL_DB', 'gold_prices')
        self.port = int(os.getenv('MYSQL_PORT', 3306))

    def connect(self):

        logging.debug(
            f"Attempting to connect to MySQL. Host={self.host}, "
            f"Port={self.port}, DB={self.db_name}, User={self.user}"
        )
        try:
            conn = mysql.connector.connect(
                host=self.host,
                user=self.user,
                passwd=self.password,
                database=self.db_name,
                port=self.port
            )
            if conn.is_connected():
                logging.debug("MySQL connection established successfully.")
            return conn
        except Error as e:
            logging.error("Error connecting to MySQL database.", exc_info=True)
            traceback.print_exc()
            return None

    def insert_gold_prices(self, gold_prices):
        logging.debug(f"Preparing to insert gold prices: {gold_prices}")
        connection = self.connect()
        if connection is not None:
            cursor = None
            try:
                cursor = connection.cursor()
                query = """
                    INSERT INTO gold_prices (gold_type, buy_price, sell_price, change_price)
                    VALUES (%s, %s, %s, %s)
                """
                data_tuples = [
                    (item['gold_type'], item['buy'], item['sell'], item['change'])
                    for item in gold_prices
                ]
                logging.debug(f"Executing INSERT with data: {data_tuples}")
                cursor.executemany(query, data_tuples)
                connection.commit()
                logging.info(f"Inserted {cursor.rowcount} rows into gold_prices.")
            except Error as e:
                logging.error("Error while inserting into MySQL.", exc_info=True)
                traceback.print_exc()
            finally:
                if cursor:
                    cursor.close()
                connection.close()
        else:
            logging.error("No MySQL connection. Insert aborted.")

    def get_latest_gold_prices(self):
        logging.debug("Fetching latest gold prices (with max timestamp for each gold_type in last 1 day).")
        connection = self.connect()
        results = []
        if connection is not None:
            cursor = None
            try:
                cursor = connection.cursor(dictionary=True)
                query = """
                    SELECT
                        gp.gold_type,
                        gp.buy_price  AS buy,
                        gp.sell_price AS sell,
                        DATE_FORMAT(gp.timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp
                    FROM gold_prices gp
                    JOIN (
                        SELECT gold_type, MAX(timestamp) as max_ts
                        FROM gold_prices
                        GROUP BY gold_type
                    ) AS sub
                        ON gp.gold_type = sub.gold_type
                        AND gp.timestamp = sub.max_ts
                """
                logging.debug(f"Executing query: {query}")
                cursor.execute(query)
                results = cursor.fetchall()
                logging.debug(f"Query returned {len(results)} rows.")
            except Error as e:
                logging.error("Error fetching latest gold prices.", exc_info=True)
                traceback.print_exc()
            finally:
                if cursor:
                    cursor.close()
                connection.close()
        else:
            logging.error("No MySQL connection. Cannot fetch latest prices.")
        return results

