"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var twitter_api_v2_1 = require("twitter-api-v2");
var dotenv = require("dotenv");
var client_1 = require("@libsql/client");
dotenv.config();
// Twitter API credentials from .env
var client = new twitter_api_v2_1.TwitterApi({
    appKey: process.env.API_KEY,
    appSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
});
var turso = (0, client_1.createClient)({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
function getResults() {
    return __awaiter(this, void 0, void 0, function () {
        var result, seViene, noSeViene;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, turso.execute("SELECT vote, COUNT(*) as count FROM votesss GROUP BY vote")];
                case 1:
                    result = _a.sent();
                    seViene = 0;
                    noSeViene = 0;
                    result.rows.forEach(function (row) {
                        if (row.vote === 1) {
                            seViene = row.count;
                        }
                        else if (row.vote === 0) {
                            noSeViene = row.count;
                        }
                    });
                    return [2 /*return*/, { seViene: seViene, noSeViene: noSeViene }];
            }
        });
    });
}
function tweetPercentage() {
    return __awaiter(this, void 0, void 0, function () {
        var dataFetch, total, seVienePercentage, tweet, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, getResults()];
                case 1:
                    dataFetch = _a.sent();
                    total = dataFetch.seViene + dataFetch.noSeViene;
                    if (total === 0) {
                        console.log('No votes found, skipping tweet');
                        return [2 /*return*/];
                    }
                    seVienePercentage = (dataFetch.seViene / total) * 100;
                    tweet = "Se viene en un ".concat(seVienePercentage.toFixed(2), "%.\nSe viene: ").concat(dataFetch.seViene, "\nNo se viene: ").concat(dataFetch.noSeViene, "\nFuente: cviene . com");
                    return [4 /*yield*/, client.v2.tweet(tweet)];
                case 2:
                    _a.sent();
                    console.log('Tweeted:', tweet);
                    console.log("Votes - Se viene: ".concat(dataFetch.seViene, ", No se viene: ").concat(dataFetch.noSeViene, ", Total: ").concat(total));
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error tweeting:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Run the bot
tweetPercentage();
