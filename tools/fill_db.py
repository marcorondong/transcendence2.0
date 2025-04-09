#!/usr/bin/env python3
import requests
import json
import random
from faker import Faker
import argparse

# Constants
# API_URL = "http://127.0.0.1:8000/users/"  # Replace with your actual API endpoint
DEFAULT_HOST = "localhost"
DEFAULT_PORT = 8000
DEFAULT_API_ENDPOINT = "api/v1/users/"

faker = Faker()

def generate_user():
	# Generate a random user dictionary
	return {
		"username": faker.user_name(),
		"email": faker.email(),
		"alias": faker.name(),
		"rememberme": random.choice([True, False]),
		"wins": random.randint(0, 100),
		"loses": random.randint(0, 100),
		"online": random.choice([True, False])
	}

def post_user(data, host, port, endpoint):
	# Send a POST request to create a user
	try:
		# response = requests.post(API_URL, json=data)
		response = requests.post(f"http://{host}:{port}/{endpoint}", json=data)
		if response.status_code == 201:
			print(f"Success: User {data.get('username')} created.")
		else:
			print(f"Error: Failed to create user {data.get('username')}. Status code: {response.status_code}")
			print(f"Response: {response.json()}")
	except requests.RequestException as e:
		print(f"Error: {e}")

def auto_generate_users(count, host, port, endpoint):
	# Auto-generate and POST multiple users
	for _ in range(count):
		user = generate_user()
		post_user(user, host, port, endpoint)

# def main():
# 	print("1. Populate from a file")
# 	print("2. Auto-generate users")
# 	choice = input("Select an option: ")

# 	if choice == "1":
# 		file_path = input("Enter the path to your JSON file: ")
# 		try:
# 			with open(file_path, "r") as file:
# 				users = json.load(file)
# 			for user in users:
# 				post_user(user)
# 		except (FileNotFoundError, json.JSONDecodeError) as e:
# 			print(f"Error: {e}")
# 	elif choice == "2":
# 		count = int(input("Enter the number of users to generate: "))
# 		auto_generate_users(count)
# 	else:
# 		print("Invalid choice.")

def main():
	parser = argparse.ArgumentParser(description="Populate the database with users.")
	parser.add_argument("-m", "--mode", choices=["file", "auto"], help="Mode of operation")
	parser.add_argument("-f", "--file", type=str, help="Path to JSON file (for 'file' mode)")
	parser.add_argument("-c", "--count", type=int, help="Number of users to generate (for 'auto' mode)")
	parser.add_argument("--host", type=str, default=DEFAULT_HOST, help="Django server host")
	parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Django server port")
	parser.add_argument("--endpoint", type=str, default=DEFAULT_API_ENDPOINT, help="Django API endpoint")
	args = parser.parse_args()

	print(f"Using Django server at {args.host}:{args.port}/{args.endpoint}")

	# Interactive mode if no mode is provided
	if not args.mode:
		print("1. Populate from a file")
		print("2. Auto-generate users")
		choice = input("Select an option: ").strip()

		if choice == "1":
			args.mode = "file"
		elif choice == "2":
			args.mode = "auto"
		else:
			print("Invalid choice.")
			return

	# Handle 'file' mode
	if args.mode == "file":
		if not args.file:
			args.file = input("Enter the path to your JSON file: ").strip()
		try:
			with open(args.file, "r") as file:
				users = json.load(file)
			for user in users:
				post_user(user, args.host, args.port, args.endpoint)
			print(f"Successfully added {len(users)} users.")
		except FileNotFoundError:
			print(f"Error: File '{args.file}' not found.")
		except json.JSONDecodeError:
			print(f"Error: File '{args.file}' is not a valid JSON.")

	# Handle 'auto' mode
	elif args.mode == "auto":
		if not args.count:
			try:
				args.count = int(input("Enter the number of users to generate: ").strip())
			except ValueError:
				print("Error: Please enter a valid number.")
				return

		auto_generate_users(args.count, args.host, args.port, args.endpoint)
		# print(f"Successfully generated {args.count} users.")


if __name__ == "__main__":
	main()
