import {TokenService} from '@loopback/authentication';
import {expect} from '@loopback/testlab';
import {securityId} from '@loopback/security';
import {Suite} from 'mocha';
import {Basesnippet} from '../../models';
import {
  handleWebsocketMessage,
  matchesFilterSettings,
  WebsocketContainer,
} from '../../utils/websocket';

describe('Websocket unit tests', function (this: Suite) {
  [
    {
      input: [{tags: ['a']}, {filter: {}}],
      expected: true,
    },
    {
      input: [{tags: ['a', 'p']}, {filter: {tags: ['b', 'c']}}],
      expected: false,
    },
    {
      input: [{snippetType: 'anotherType'}, {filter: {snippetType: ['aType']}}],
      expected: false,
    },
    {
      input: [{snippetType: 'aType'}, {filter: {snippetType: ['aType']}}],
      expected: true,
    },
    {
      input: [{tags: ['a', 'p']}, {filter: {tags: ['a', 'c']}}],
      expected: true,
    },
    {
      input: [
        {tags: ['a', 'p'], snippetType: 'anotherType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: ['a', 'p'], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: true,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {snippetType: []}},
      ],
      expected: true,
    },
    {
      input: [{tags: ['b', 'p'], snippetType: 'aType'}, {filter: {tags: []}}],
      expected: true,
    },
    {
      input: [
        {tags: ['b', 'p'], snippetType: 'aType'},
        {filter: {tags: [], snippetType: []}},
      ],
      expected: true,
    },
    {
      input: [
        {tags: [], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
      ],
      expected: false,
    },
    {
      input: [
        {tags: [], snippetType: 'aType'},
        {filter: {tags: ['a', 'c'], snippetType: ['aType']}},
        {updatedFields: {tags: []}, removedFields: {}},
      ],
      expected: true,
    },
  ].forEach((t, i) => {
    it(`Should test matchesFilterSettings ${i}`, () => {
      expect(
        matchesFilterSettings(
          t.input[0] as Basesnippet,
          t.input[1],
          t.input[2] as {updatedFields: object; removedFields: object},
        ),
      ).to.be.eql(t.expected);
    });
  });
});

describe('Websocket message handling', function (this: Suite) {
  const userProfile = {[securityId]: 'anId', roles: ['aGroup']};
  const validToken = 'aValidToken';
  let sent: string[];
  let ws: {send: (message: string) => void};
  let websocketMap: WebsocketContainer;

  const jwtService = {
    verifyToken: async (token: string) => {
      if (token !== validToken) throw new Error('Token invalid');
      return userProfile;
    },
  } as unknown as TokenService;

  const join = (payload: object) =>
    handleWebsocketMessage(
      ws,
      JSON.stringify(payload),
      jwtService,
      websocketMap,
    );

  beforeEach(() => {
    sent = [];
    ws = {send: (message: string) => sent.push(message)};
    websocketMap = {};
  });

  ['notJson', '{"message":', ''].forEach(message => {
    it(`Should answer with an error on unparsable message '${message}'`, async () => {
      await handleWebsocketMessage(ws, message, jwtService, websocketMap);
      expect(sent).to.be.eql([JSON.stringify({error: 'Message invalid'})]);
      expect(websocketMap).to.be.eql({});
    });
  });

  ['null', '"aString"', '12', 'true', '[{"message":{}}]'].forEach(message => {
    it(`Should answer with an error on non object message '${message}'`, async () => {
      await handleWebsocketMessage(ws, message, jwtService, websocketMap);
      expect(sent).to.be.eql([JSON.stringify({error: 'Message invalid'})]);
      expect(websocketMap).to.be.eql({});
    });
  });

  [
    {},
    {message: null},
    {message: 'aString'},
    {message: {join: 'aLogbook'}},
  ].forEach(payload => {
    it(`Should ignore the incomplete request ${JSON.stringify(payload)}`, async () => {
      await join(payload);
      expect(sent).to.be.eql([]);
      expect(websocketMap).to.be.eql({});
    });
  });

  it('Should answer with an error on an invalid token', async () => {
    await join({message: {join: 'aLogbook', token: 'anInvalidToken'}});
    expect(sent).to.be.eql([JSON.stringify({error: 'Token invalid'})]);
    expect(websocketMap).to.be.eql({});
  });

  it('Should default the config when it is not sent', async () => {
    await join({message: {join: 'aLogbook', token: validToken}});
    expect(sent).to.be.eql([]);
    expect(websocketMap['aLogbook']).to.be.eql([
      {ws: ws, user: userProfile, config: {filter: {}}},
    ]);
  });

  it('Should default the config when it is sent as null', async () => {
    await join({message: {join: 'aLogbook', token: validToken, config: null}});
    expect(websocketMap['aLogbook'][0].config).to.be.eql({filter: {}});
  });

  it('Should keep the config when it is sent', async () => {
    const config = {filter: {tags: ['aTag']}};
    await join({
      message: {join: 'aLogbook', token: validToken, config: config},
    });
    expect(websocketMap['aLogbook'][0].config).to.be.eql(config);
  });

  it('Should append a second client to the same logbook', async () => {
    await join({message: {join: 'aLogbook', token: validToken}});
    await join({message: {join: 'aLogbook', token: validToken}});
    expect(websocketMap['aLogbook']).to.have.length(2);
  });
});
