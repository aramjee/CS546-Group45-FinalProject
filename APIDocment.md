# Gym API

## Endpoints

### Get All Gyms (Gym listing page) *

- **Method:** GET
- **Endpoint:** `/gym`
- **Response:** A rendered "gymList" view with an array of gym objects and userLoggedIn status
- **error:** TBD either rerender to show error or show status code in error page
- ***sorting and filter***: for filter should easily implement in extra function in front end and use 'div class = "xxx"' to determine class. Then use OnClick to triger the extra function to sort.

### Get Gym by ID (Individual Gym page) *

- **Method:** GET
- **Endpoint:** `/gym/:id`
- **URL Parameters:**
  - `id` (string, required)
- **Response:** A rendered "gym" view with a gym object, its associated reviews and comments, and userLoggedIn status
- **error:** TBD either rerender to show error or show status code in error page, handle the invalid input

### Search Gym by Name (Wild Card Search bar (function))

- **Method:** GET
- **Endpoint:** `/gym/search`
- **Query Parameters:**
  - `name` (string, required)
- **Response:** A rendered "gymList" view with an array of gym objects that match the search query and userLoggedIn status
- **error:** TBD either rerender to show error or show status code in error page, handle the invalid input

### Manage Gyms (Gym Manage Page) *

- **Method:** GET
- **Endpoint:** `/gym/manage`
- **Response:** A rendered "manageGyms" view with an array of gym objects associated with the gym owner and userLoggedIn status, will return empty list if no created gym
- **error:** TBD either rerender to show error or show status code in error page

### Add Gym (function in manage page (function))

- **Method:** POST
- **Endpoint:** `/gym/add`
- **Body Parameters:**
  - `gymName` (string, required)
  - `website` (string, required)
  - `category` (string, required)
  - `address` (string, required)
  - `city` (string, required)
  - `state` (string, required)
  - `zip` (string, required)
- **Response:** Redirect to `/gym/manage` with a status of 201
- **error:** TBD either rerender to show error or show status code in error page. Current redirect to /login page if not logged in.

### Delete Gym (function in manage page (function))

- **Method:** DELETE
- **Endpoint:** `/gym/delete/:gymId`
- **URL Parameters:**
  - `gymId` (string, required)
- **Response:** Redirect to `/gym/manage` with a status of 200
- - **error:** TBD either rerender to show error or show status code in error page. Current redirect to /login page if not logged in.

### Edit Gym (function in manage page (function))

- **Method:** PUT
- **Endpoint:** `/gym/edit/:gymId`
- **URL Parameters:**
  - `gymId` (string, required)
- **Body Parameters:**
  - `gymName` (string, required)
  - `website` (string, required)
  - `category` (string, required)
  - `address` (string, required)
  - `city` (string, required)
  - `state` (string, required)
  - `zip` (string, required)
- **Response:** Redirect to `/gym/manage` with a status of 200
- - **error:** TBD either rerender to show error or show status code in error page. Current redirect to /login page if not logged in.

### Thumb Up (Update Liked Gyms Count(function))

- **Method:** POST
- **Endpoint:** `/gym/:id/like`
- **URL Parameters:**
  - `id` (string, required)
- **Response:** Redirect to `/gym/${gymId}` with a status of 200
- **error:** TBD, should rerender page and show error message

### Thumb Down (Update Disliked Gyms Count(function))

- **Method:** POST
- **Endpoint:** `/gym/:id/dislike`
- **URL Parameters:**
  - `id` (string, required)
- **Response:** Redirect to `/gym/${gymId}` with a status of 200
- **error:** TBD, should rerender page and show error message
