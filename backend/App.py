import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from mysql.connector import Error
import traceback

from database import DatabaseManager
from scraper_scheduler import init_scheduler

load_dotenv() 

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(level=LOG_LEVEL, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)
CORS(app)

@app.route('/latest-prices')
def get_latest_gold_prices():

    logging.debug("Received request: GET /latest-prices")
    try:
        db_manager = DatabaseManager()
        logging.debug("Calling db_manager.get_latest_gold_prices()")
        results = db_manager.get_latest_gold_prices()

        logging.debug(f"db_manager.get_latest_gold_prices() returned {len(results)} rows.")
        logging.debug(f"Latest prices data: {results}")

        return jsonify(results)
    except Exception as e:
        logging.error("Failed to fetch latest prices.", exc_info=True)
        traceback.print_exc()

        return jsonify({"error": "Error fetching latest prices"}), 500


@app.route('/historical-prices/<gold_type>/<transaction_type>')
def get_historical_prices(gold_type, transaction_type):

    logging.debug(f"Received request: GET /historical-prices/{gold_type}/{transaction_type}")
    logging.info(f"Fetching historical prices for {gold_type} with transaction type {transaction_type}")

    db_manager = DatabaseManager()
    connection = db_manager.connect()
    if connection is not None:
        cursor = None
        try:
            cursor = connection.cursor(dictionary=True)
            if transaction_type == 'buy':
                query = """
                    SELECT timestamp, buy_price AS price
                    FROM gold_prices
                    WHERE gold_type = %s
                      AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                    ORDER BY timestamp ASC
                """
            else:
                query = """
                    SELECT timestamp, sell_price AS price
                    FROM gold_prices
                    WHERE gold_type = %s
                      AND timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
                    ORDER BY timestamp ASC
                """
            logging.debug(f"Executing query: {query} with param gold_type={gold_type}")
            cursor.execute(query, (gold_type,))
            results = cursor.fetchall()

            logging.debug(f"Query returned {len(results)} rows for gold_type={gold_type} transaction={transaction_type}")
            logging.debug(f"Historical data: {results}")

            return jsonify(results)
        except Error as e:
            logging.error("Error fetching historical data from MySQL.", exc_info=True)
            traceback.print_exc()

            return jsonify({"error": "Error fetching data"}), 500
        finally:
            if cursor:
                cursor.close()
            connection.close()
    else:
        logging.error("Failed to connect to the database for historical data.")
        return jsonify({"error": "Failed to connect to the database"}), 500


@app.route('/')
def hello():
    logging.debug("Received request: GET /")
    return jsonify({"message": "Use /latest-prices to get the latest gold prices."})


if __name__ == '__main__':
    init_scheduler(app)

    debug_mode = (os.getenv("FLASK_ENV", "development") == "development")
    logging.debug(f"Starting Flask app with debug_mode={debug_mode}")

    app.run(debug=debug_mode, use_reloader=False)
