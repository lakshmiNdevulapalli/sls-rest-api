//Mock Test
/*it("Should pass", () => {
  expect(true).toBe(true);
});
*/

"use strict";
let init = require("./steps/init");
let { an_authenticated_user } = require("./steps/given");
let {
  we_invoke_createNote,
  we_invoke_updateNote,
  we_invoke_deleteNote,
} = require("./steps/when");
let idToken;

describe(`Given an authenticated user`, () => {
  beforeAll(async () => {
    init();
    let user = await an_authenticated_user();
    idToken = user.AuthenticationResult.IdToken;
    console.log(idToken);
  });

  describe(`When we invoke POST /notes endpoint`, () => {
    it("Should create a new note", async () => {
      const body = {
        id: "1000",
        title: "My Test note",
        body: "Hellow this is My test body ",
      };
      let result = await we_invoke_createNote({ idToken, body }); //sending idToken to authorize the request
      expect(result.statusCode).toEqual(201);
      expect(result.body).not.toBeNull();
    });
  });

  describe(`When we invoke PUT /notes/:id endpoint`, () => {
    it("Should update the note", async () => {
      const noteId = "1000";
      const body = {
        title: "My Updated Test note",
        body: "Hello this is the updated test body ",
      };
      let result = await we_invoke_updateNote({ idToken, body, noteId }); //sending idToken to authorize the request
      expect(result.statusCode).toEqual(200);
      expect(result.body).not.toBeNull();
    });
  });

  describe(`When we invoke DELETE /notes/:id endpoint`, () => {
    it("Should delete the note", async () => {
      const noteId = "1000"; // delete does not expect body only Notes ID is required
      let result = await we_invoke_deleteNote({ idToken, noteId }); //sending idToken to authorize the request
      expect(result.statusCode).toEqual(200);
      expect(result.body).not.toBeNull();
    });
  });
});
