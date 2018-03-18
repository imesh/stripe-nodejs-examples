/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const stripe = require('stripe')('<api-key>');

/**
 * Create a customer
 * @param {} email email address of the customer
 */
function createCustomer(email, token) {
  return new Promise(function (resolve, reject) {
    console.log('Creating customer...');
    stripe.customers.create({
      email: email,
      source: token
    }).then(function (customer) {
      console.log("Customer created: [id] " + customer.id);
      resolve(customer);
    }).catch(function (err) {
      console.log("Could not create customer: " + err.message);
      return reject(err);
    });
  });
}

/**
 * Create a card token by providing credit/debit card information
 * @param {*} token Card token
 */
function createCardToken(token) {
  return new Promise(function (resolve, reject) {
    console.log("Creating card token...");
    stripe.tokens.create(token).then(
      function (token) {
        console.log("Card token created: [token-id] " + token.id);
        return resolve(token);
      }).catch(function (err) {
        console.log("Could not create card token: " + err.message);
        return reject(err);
      });;
  });
}

/**
 * Subscribe a customer to a plan
 * @param {*} customer Customer entity
 * @param {*} planId Plan identifier
 */
function subscribeCustomerToPlan(customer, planId) {
  return new Promise(function (resolve, reject) {
    console.log("Creating subscription...");
    stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        plan: planId,
      },
      ]
    }).then(function (subscription) {
      console.log("Customer subscribed to plan: [customer-id] " + customer.id + " [plan-id] " + planId);
      resolve(subscription);
    }).catch(function (err) {
      console.log("Could not subscribe customer to plan: " + err);
      reject(err);
    });
  });
}

/**
 * List invoices of customer
 * @param {*} customerId Customer id
 */
function listInvoices(customerId) {
  return new Promise(function (resolve, reject) {
    console.log("Listing invoices of customer: [customer-id] " + customerId);
    stripe.invoices.list({ customer: customerId })
      .then(function (invoices) {
        resolve(invoices);
      })
      .catch(function (err) {
        log.console("Could not list invoices: " + err.message);
        reject(err);
      });
  });
}

var planId = "<plan-id>";
// A test credit card information
var token = {
  card: {
    "number": '4242424242424242',
    "exp_month": 12,
    "exp_year": 2020,
    "cvc": '123'
  }
};

// Create card token
createCardToken(token).then(
  function (token) {
    // Create customer with email and card token
    createCustomer("foo@example.com", token.id)
      .then(function (customer, token) {
        // Subscribe customer to plan
        subscribeCustomerToPlan(customer, planId)
          .then(function (response) {
            // List customer invoices
            listInvoices(customer.id)
              .then(function (invoices) {
                console.log(invoices);
              })
          })
          .catch(function (err) {
            console.log(err);
          });
      })
      .catch(function (err) {
        console.log(err);
      });
  }).catch(function (err) {
    console.log(err);
  });
