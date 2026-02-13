import { head } from "framer-motion/client";
import { platform } from "os";
import { Provider } from "react-redux";

interface ProviderGame {
    platform: string,
    provider: string;
    games: {
        game_name: string;
        game_code: string;
        game_type: string;
        game_image: string;
    }[];
}

const gameData = [
    {
        username: "Pixel Pirate",
        amount: "$85K",
        image: "/hero.jpg",
    },
    {
        username: "Code Ninja",
        amount: "$142K",
        image: "/hero.jpg",
    },
    {
        username: "UI Wizard",
        amount: "$199K",
        image: "/hero.jpg",
    },
    {
        username: "Dark Coder",
        amount: "$78K",
        image: "/hero.jpg",
    },
    {
        username: "React Rebel",
        amount: "$121K",
        image: "/hero.jpg",
    },
    {
        username: "Tailwind Tycoon",
        amount: "$133K",
        image: "/hero.jpg",
    },
    {
        username: "JS Bandit",
        amount: "$64K",
        image: "/hero.jpg",
    },
    {
        username: "Node Nomad",
        amount: "$110K",
        image: "/hero.jpg",
    },
    {
        username: "Vue Veteran",
        amount: "$97K",
        image: "/hero.jpg",
    },
    {
        username: "Next Knight",
        amount: "$154K",
        image: "/hero.jpg",
    },
    {
        username: "GraphQL Guru",
        amount: "$118K",
        image: "/hero.jpg",
    },
    {
        username: "CSS Conqueror",
        amount: "$105K",
        image: "/hero.jpg",
    },
    {
        username: "Async Ace",
        amount: "$139K",
        image: "/hero.jpg",
    },
    {
        username: "Hook Hero",
        amount: "$160K",
        image: "/hero.jpg",
    },
];
const categories = [
    { bnName:"", name: "Spribe",type:'provider', icon: "/icons/poker.png" },
    { bnName:"স্লট", name: "Slot",type:'category', icon: "/icons/slots.png" },
    { bnName:"", name: "Jilli",type:'provider', icon: "/icons/jilli.png" },
    { bnName:"", name: "Jdb",type:'provider', icon: "/icons/fire.png" },
    { bnName:"ফিশিং", name: "Fishing",type:'category', icon: "/icons/fish.png" },
    { bnName:"", name: "Cq9",type:'provider', icon: "/icons/star.png" },
    { bnName:"", name: "PGSoft",type:'provider', icon: "/icons/star.png" },
    { bnName:"", name: "pragmatic",type:'provider', icon: "/icons/star.png" },
    { bnName:"", name: "saba",type:'provider', icon: "/icons/sports.png" },
    { bnName:"", name: "playngo",type:'provider', icon: "/icons/star.png" },
    { bnName:"লাইভ", name: "Live",type:'category', icon: "/icons/live.png" },
    { bnName:"", name: "Evolution",type:'provider', icon: "/icons/star.png" },
    { bnName:"", name: "Sexybcrt",type:'provider', icon: "/icons/sports.png" },
    { bnName:"", name: "Crash",type:'category', icon: "/icons/crash.png" },
    { bnName:"", name: "Poker",type:'category',  icon: "/icons/poker.png" },
    { bnName:"খেলা", name: "Sports",type:'category',  icon: "/icons/sports.png" },
    //new
    { name: "fachai",type:'provider', icon: "/icons/star.png" },
    { name: "eazygaming",type:'provider', icon: "/icons/live.png" },
    { name: "gameart",type:'provider', icon: "/icons/sports.png" },
    { name: "bggaming",type:'provider', icon: "/icons/star.png" },
    { name: "km",type:'provider', icon: "/icons/star.png" },
    { name: "relaxgaming",type:'provider', icon: "/icons/sports.png" },
    { name: "evoplay",type:'provider', icon: "/icons/live.png" },
    { name: "ezugi",type:'provider', icon: "/icons/live.png" },
    { name: "kmone",type:'provider', icon: "/icons/sports.png" },
    { name: "ideal",type:'provider', icon: "/icons/star.png" },
    { name: "ag",type:'provider', icon: "/icons/live.png" },
    { name: "playtech",type:'provider', icon: "/icons/star.png" },
    

];
const coinFaces = {
    tails: "https://i.ibb.co/h1fhqR46/tails.jpg",
    heads: "https://i.ibb.co/6JptnkbF/heads.jpg",
};



const pgsoft = {
    platform: 'digital',
    provider: 'pgsoft',
    games:
        [
            {
                "game_name": "Mahjong Ways",
                "game_code": "1189baca156e1bbbecc3b26651a63565",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Mahjong-Ways_rounded_1024.png"
            },
            {
                "game_name": "Mahjong Ways 2",
                "game_code": "ba2adf72179e1ead9e3dae8f0a7d4c07",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Mahjong-Ways2_rounded_1024.png"
            },
            {
                "game_name": "Treasures of Aztec",
                "game_code": "2fa9a84d096d6ff0bab53f81b79876c8",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Treasures-of-Aztec_rounded_1024.png"
            },
            {
                "game_name": "Leprechaun Riches",
                "game_code": "fb2a2ac51303c0a0801dbe6a72d936f7",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Leprechaun-Riches_rounded_1024.png"
            },
            {
                "game_name": "Lucky Neko",
                "game_code": "e1b4c6b95746d519228744771f15fe4b",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Lucky-Neko_icon_1024_rounded.png"
            },
            {
                "game_name": "Captain's Bounty",
                "game_code": "cd29b9906a852ce26b53b6d6d81037d4",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Captains-Bounty_Icon_Rounded_1024.png"
            },
            {
                "game_name": "Queen of Bounty",
                "game_code": "83a6890cf84e4c5a6bacf96d5355d472",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Queen-of-Bounty_1024_rounded.png"
            },
            {
                "game_name": "Wild Bandito",
                "game_code": "95fc290bb05c07b5aad1a054eba4dcc4",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Wild-Bandito_icon_1024_rounded.png"
            },
            {
                "game_name": "Ways of the Qilin",
                "game_code": "fedfca553a97a791a3a41c4f1e3bff58",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Ways-of-the-Qilin_icon_1024_rounded.png"
            },
            {
                "game_name": "Dragon Hatch",
                "game_code": "4afef91d3addb9ce5107abaf3342b9a5",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/pg/Dragon-Hatch_rounded_1024.png"
            }
        ]
}
const cq9 = {
    platform: 'digital',
    provider: 'cq9',
    games: [
        {
            "game_name": "JumpHigh",
            "game_code": "630a841b4cf75a38e2e657040f785e63",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/JumpHigh.png"
        },
        {
            "game_name": "Rave Jump",
            "game_code": "b602205d6a56d999df188e17ecc2bc91",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Rave-Jump.png"
        },
        {
            "game_name": "Jump High 2",
            "game_code": "8d57ec6274960fe2f2c252f4a49adf7f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Jump-High-2.png"
        },
        {
            "game_name": "Jumping mobile",
            "game_code": "1282953e9452fe2852cb1724b4b9d617",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Jumping-mobile.png"
        },
        {
            "game_name": "Good Fortune M",
            "game_code": "50568ba2a8da9f30dded83dbbd3655d6",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Good-Fortune-M.png"
        },
        {
            "game_name": "God of War",
            "game_code": "f4b6484dc2b96fc339604446cd042534",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/God-of-War.png"
        },
        {
            "game_name": "FlyOut",
            "game_code": "afddbebb27c4b7408bda624aa9354aa7",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/FlyOut.png"
        },
        {
            "game_name": "Zeus",
            "game_code": "0f944952a27be9ab52d8deabf275a552",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Zeus.png"
        },
        {
            "game_name": "DiscoNight M",
            "game_code": "82839530d48814c586b8844b84693ca4",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/DiscoNight-M.png"
        },
        {
            "game_name": "Lucky Bats",
            "game_code": "c069592afd5d6ffab7bf759a491a71cd",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Lucky-Bats.png"
        },
        {
            "game_name": "Good Fortune",
            "game_code": "61d7c57fedb24242f4e56df7d5c80bfd",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Good-Fortune.png"
        },
        {
            "game_name": "JumpHigher",
            "game_code": "80af0735d78f6056a920770abca9f51c",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/JumpHigher.png"
        },
        {
            "game_name": "Fa Cai Shen2",
            "game_code": "da2929eef2ac66b7b3d44fdf0655c27a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Fa-Cai-Shen2.png"
        },
        {
            "game_name": "God of War M",
            "game_code": "46c55e2ba632f9ae9addda6e169f7743",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/God-of-War-M.png"
        },
        {
            "game_name": "Money Tree",
            "game_code": "cee72070e3d6fee077cfcb9a050df57d",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Money-Tree.png"
        },
        {
            "game_name": "Rave Jump mobile",
            "game_code": "7b0b749b726371330c991ad01513539a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Rave-Jump-mobile.png"
        },
        {
            "game_name": "Lucky Bats M",
            "game_code": "8d505ecfefce9b2c3058f58b415782b2",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Lucky-Bats-M.png"
        },
        {
            "game_name": "5 God Beasts",
            "game_code": "7148d1ecd2f6787e3d4cfae4580a7b86",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/5-God-Beasts.png"
        },
        {
            "game_name": "THOR",
            "game_code": "8e77c76cd001acc431fb96ce6d216f80",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/THOR.png"
        },
        {
            "game_name": "Cricket Fever",
            "game_code": "a36b6a69ffa118773a5e828bcc74dcf8",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Cricket-Fever.png"
        },
        {
            "game_name": "FaCaiShen",
            "game_code": "4fc25c66cbfd8068ff4a12faffe62469",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/FaCaiShen.png"
        },
        {
            "game_name": "Gu Gu Gu 3",
            "game_code": "260d42bbe34ce7149c636e339100364b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Gu-Gu-Gu-3.png"
        },
        {
            "game_name": "Move n' Jump",
            "game_code": "8eba0f6d7c38fa6ced38f3abc6409e7f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Move-n-Jump.png"
        },
        {
            "game_name": "Jump Higher mobile",
            "game_code": "e78b31bc60d05582a34cc19871520cb6",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Jump-Higher-mobile.png"
        },
        {
            "game_name": "Flying Cai Shen",
            "game_code": "660de502d52d1f4566aeab989491686f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Flying-Cai-Shen.png"
        },
        {
            "game_name": "Fire Chibi 2",
            "game_code": "b05efbb809025d5450f08bdec8febee2",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Fire-Chibi-2.png"
        },
        {
            "game_name": "DiscoNight",
            "game_code": "4b5dce5597380d02a6daa1946ebfd118",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/DiscoNight.png"
        },
        {
            "game_name": "Wonderland",
            "game_code": "8764cec7c0232e476536c00145089732",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Wonderland.png"
        },
        {
            "game_name": "Thor 2",
            "game_code": "585f5e69e9fd929d2a78e3d392a22c8e",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Thor-2.png"
        },
        {
            "game_name": "Da Hong Zhong",
            "game_code": "09000b2086ef8632326e33b75714639b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Da-Hong-Zhong.png"
        },
        {
            "game_name": "Zhong Kui",
            "game_code": "f57af26972d04aeb3918b407fd280187",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Zhong-Kui.png"
        },
        {
            "game_name": "Da Fa Cai",
            "game_code": "7781583727b17e3c0abd06033338f15b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Da-Fa-Cai.png"
        },
        {
            "game_name": "Flower Fortunes",
            "game_code": "db0174a59d12ec0480cdfafa50fe8103",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Flower-Fortunes.png"
        },
        {
            "game_name": "Fire Queen 2",
            "game_code": "a1f1dac8df2ab915628830539f8bb7d7",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Fire-Queen-2-.png"
        },
        {
            "game_name": "Baseball Fever",
            "game_code": "1b2895c147b842611771c9815000aaa4",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Baseball-Fever.png"
        },
        {
            "game_name": "Double Fly",
            "game_code": "dabd7e6cc8c05effa4d868ebc088f189",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Double-Fly-.png"
        },
        {
            "game_name": "Night City",
            "game_code": "20ac774b757e927af3fd59a67e39254a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Night-City.png"
        },
        {
            "game_name": "Funny Alpaca",
            "game_code": "a6eeb19d6fce96c0b2aef905f01cd46b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Funny-Alpaca.png"
        },
        {
            "game_name": "Invincible Elephant",
            "game_code": "c66bcf7a826e781c96cd214c97ae2b67",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Invincible-Elephant.png"
        },
        {
            "game_name": "Chameleon",
            "game_code": "88e704fd702c1318b8ac1b2c540ea308",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Chameleon.png"
        },
        {
            "game_name": "Treasure Pirate",
            "game_code": "870473a09d666f7c52c3e655f2b64b77",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Treasure-Pirate.png"
        },
        {
            "game_name": "Six Candy",
            "game_code": "aaff1c8eea4138515f7dc48b9c28503b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Six-Candy.png"
        },
        {
            "game_name": "Fa Cai Shen M",
            "game_code": "4c5fff40be0ac1e597fa24f3c0a656e9",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Fa-Cai-Shen-M.png"
        },
        {
            "game_name": "TreasureBowl",
            "game_code": "5172f73c2829b9cec48b0c7d856ae26a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/TreasureBowl.png"
        },
        {
            "game_name": "888 Cai Shen",
            "game_code": "28a39e51864bae9fcebdbc6f738815de",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/888-Cai-Shen.png"
        },
        {
            "game_name": "Hercules",
            "game_code": "93060689fb6ddb3823702549ae22fbc7",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Hercules.png"
        },
        {
            "game_name": "Fire Queen",
            "game_code": "43177e1be3e726f8dd532c594a0fe54f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Fire-Queen.png"
        },
        {
            "game_name": "So Sweet",
            "game_code": "6e5050176c0efae891a5bcc9e8958329",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/So-Sweet.png"
        },
        {
            "game_name": "GuGuGu",
            "game_code": "7ecdf8a456674beeb3665f2a0e15e322",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/GuGuGu.png"
        },
        {
            "game_name": "RaveHigh",
            "game_code": "191678951989eed5609ce6cf2252f0c1",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/RaveHigh.png"
        },
        {
            "game_name": "Paradise",
            "game_code": "201cd3554cef14c33b4f4011a9506d8d",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/Paradise.png"
        },
        {
            "game_name": "LuckyFishing",
            "game_code": "bdbb2665530867b57a3e3a42103fe39a",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/cq9/LuckyFishing.png"
        }
    ]
}

const jilli = {
    platform: 'digital',
    provider: 'jilli',
    games:
        [
            {
                "game_name": "Chin Shi Huang",
                "game_code": "24da72b49b0dd0e5cbef9579d09d8981",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Chin-Shi-Huang.png"
            },
            {
                "game_name": "God Of Martial",
                "game_code": "21ef8a7ddd39836979170a2e7584e333",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/God-Of-Martial.png"
            },
            {
                "game_name": "Hot Chilli",
                "game_code": "c845960c81d27d7880a636424e53964d",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Hot-Chilli.png"
            },
            {
                "game_name": "Fortune Tree",
                "game_code": "6a7e156ceec5c581cd6b9251854fe504",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fortune-Tree.png"
            },
            {
                "game_name": "War Of Dragons",
                "game_code": "4b1d7ffaf9f66e6152ea93a6d0e4215b",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/War-Of-Dragons.png"
            },
            {
                "game_name": "Gem Party",
                "game_code": "756cf3c73a323b4bfec8d14864e3fada",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Gem-Party.png"
            },
            {
                "game_name": "Lucky Ball",
                "game_code": "893669898cd25d9da589a384f1d004df",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Lucky-Ball.png"
            },
            {
                "game_name": "Hyper Burst",
                "game_code": "a47b17970036b37c1347484cf6956920",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Hyper-Burst.png"
            },
            {
                "game_name": "Shanghai Beauty",
                "game_code": "795d0cae623cbf34d7f1aa93bbcded28",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Shanghai-Beauty.png"
            },
            {
                "game_name": "Fa Fa Fa",
                "game_code": "54c41adcf43fdb6d385e38bc09cd77ca",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fa-Fa-Fa.png"
            },
            {
                "game_name": "Candy Baby",
                "game_code": "2cc3b68cbcfacac2f7ef2fe19abc3c22",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Candy-Baby.png"
            },
            {
                "game_name": "Hawaii Beauty",
                "game_code": "6409b758471b6df30c6b137b49f4d92e",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Hawaii-Beauty.png"
            },
            {
                "game_name": "SevenSevenSeven",
                "game_code": "61d46add6841aad4758288d68015eca6",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/SevenSevenSeven.png"
            },
            {
                "game_name": "Bubble Beauty",
                "game_code": "a78d2ed972aab8ba06181cc43c54a425",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Bubble-Beauty.png"
            },
            {
                "game_name": "FortunePig",
                "game_code": "8488c76ee2afb8077fbd7eec62721215",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/FortunePig.png"
            },
            {
                "game_name": "Crazy777",
                "game_code": "8c62471fd4e28c084a61811a3958f7a1",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Crazy777.png"
            },
            {
                "game_name": "Bao boon chin",
                "game_code": "8c4ebb3dc5dcf7b7fe6a26d5aadd2c3d",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Bao-boon-chin.png"
            },
            {
                "game_name": "Night City",
                "game_code": "78e29705f7c6084114f46a0aeeea1372",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Night-City.png"
            },
            {
                "game_name": "Fengshen",
                "game_code": "09699fd0de13edbb6c4a194d7494640b",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fengshen.png"
            },
            {
                "game_name": "Crazy FaFaFa",
                "game_code": "a57a8d5176b54d4c825bd1eee8ab34df",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Crazy-FaFaFa.png"
            },
            {
                "game_name": "XiYangYang",
                "game_code": "5a962d0e31e0d4c0798db5f331327e4f",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/XiYangYang.png"
            },
            {
                "game_name": "DiamondParty",
                "game_code": "48d598e922e8c60643218ccda302af08",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/DiamondParty.png"
            },
            {
                "game_name": "Golden Bank",
                "game_code": "c3f86b78938eab1b7f34159d98796e88",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Golden-Bank.png"
            },
            {
                "game_name": "Dragon Treasure",
                "game_code": "c6955c14f6c28a6c2a0c28274fec7520",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dragon-Treasure.png"
            },
            {
                "game_name": "Charge Buffalo",
                "game_code": "984615c9385c42b3dad0db4a9ef89070",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Charge-Buffalo.png"
            },
            {
                "game_name": "Lucky Goldbricks",
                "game_code": "d84ef530121953240116e3b2e93f6af4",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Lucky-Goldbricks.png"
            },
            {
                "game_name": "Super Ace",
                "game_code": "bdfb23c974a2517198c5443adeea77a8",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Super-Ace.png"
            },
            {
                "game_name": "Money Coming",
                "game_code": "db249defce63610fccabfa829a405232",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Money-Coming.png"
            },
            {
                "game_name": "Golden Queen",
                "game_code": "8de99455c2f23f6827666fd798eb80ef",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Golden-Queen.png"
            },
            {
                "game_name": "Jungle King",
                "game_code": "4db0ec24ff55a685573c888efed47d7f",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Jungle-King.png"
            },
            {
                "game_name": "Monkey Party",
                "game_code": "fd369a4a7486ff303beea267ec5c8eff",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Monkey-Party.png"
            },
            {
                "game_name": "Boxing King",
                "game_code": "981f5f9675002fbeaaf24c4128b938d7",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Boxing-King.png"
            },
            {
                "game_name": "Secret Treasure",
                "game_code": "1d1f267e3a078ade8e5ccd56582ac94f",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Secret-Treasure.png"
            },
            {
                "game_name": "Pharaoh Treasure",
                "game_code": "c7a69ab382bd1ff0e6eb65b90a793bdd",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Pharaoh-Treasure.png"
            },
            {
                "game_name": "Lucky Coming",
                "game_code": "ba858ec8e3b5e2b4da0d16b3a2330ca7",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Lucky-Coming.png"
            },
            {
                "game_name": "Super Rich",
                "game_code": "b92f491a63ac84b106b056e9d46d35c5",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Super-Rich.png"
            },
            {
                "game_name": "RomaX",
                "game_code": "e5ff8e72418fcc608d72ea21cc65fb70",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/RomaX.png"
            },
            {
                "game_name": "Golden Empire",
                "game_code": "490096198e28f770a3f85adb6ee49e0f",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Golden-Empire.png"
            },
            {
                "game_name": "Fortune Gems",
                "game_code": "a990de177577a2e6a889aaac5f57b429",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fortune-Gems.png"
            },
            {
                "game_name": "Crazy Hunter",
                "game_code": "69082f28fcd46cbfd10ce7a0051f24b6",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Crazy-Hunter.png"
            },
            {
                "game_name": "Party Night",
                "game_code": "d505541d522aa5ca01fc5e97cfcf2116",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Party-Night.png"
            },
            {
                "game_name": "Magic Lamp",
                "game_code": "582a58791928760c28ec4cef3392a49f",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Magic-Lamp.png"
            },
            {
                "game_name": "Agent Ace",
                "game_code": "8a4b4929e796fda657a2d38264346509",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Agent-Ace.png"
            },
            {
                "game_name": "TWIN WINS",
                "game_code": "c74b3cbda5d16f77523e41c25104e602",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/TWIN-WINS.png"
            },
            {
                "game_name": "Ali Baba",
                "game_code": "cc686634b4f953754b306317799f1f39",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Ali-Baba.png"
            },
            {
                "game_name": "Mega Ace",
                "game_code": "eba92b1d3abd5f0d37dfbe112abdf0e2",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mega-Ace.png"
            },
            {
                "game_name": "Medusa",
                "game_code": "2c17b7c4e2ce5b8bebf4bd10e3e958d7",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Medusa.png"
            },
            {
                "game_name": "Book of Gold",
                "game_code": "6b283c434fd44250d83b7c2420f164f9",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Book-of-Gold.png"
            },
            {
                "game_name": "Thor X",
                "game_code": "7e6aa773fa802aaa9cb1f2fac464736e",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Thor-X.png"
            },
            {
                "game_name": "Happy Taxi",
                "game_code": "1ed896aae4bdc78c984021307b1dd177",
                "game_type": "Slot Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Happy-Taxi.png"
            },
            {
                "game_name": "Royal Fishing",
                "game_code": "e794bf5717aca371152df192341fe68b",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Royal-Fishing.png"
            },
            {
                "game_name": "Bombing Fishing",
                "game_code": "e333695bcff28acdbecc641ae6ee2b23",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Bombing-Fishing.png"
            },
            {
                "game_name": "Dinosaur Tycoon",
                "game_code": "eef3e28f0e3e7b72cbca61e7924d00f1",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dinosaur-Tycoon.png"
            },
            {
                "game_name": "Jackpot Fishing",
                "game_code": "3cf4a85cb6dcf4d8836c982c359cd72d",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Jackpot-Fishing.png"
            },
            {
                "game_name": "Dragon Fortune",
                "game_code": "1200b82493e4788d038849bca884d773",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dragon-Fortune.png"
            },
            {
                "game_name": "Mega Fishing",
                "game_code": "caacafe3f64a6279e10a378ede09ff38",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Mega-Fishing.png"
            },
            {
                "game_name": "Boom Legend",
                "game_code": "f02ede19c5953fce22c6098d860dadf4",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Boom-Legend.png"
            },
            {
                "game_name": "Happy Fishing",
                "game_code": "71c68a4ddb63bdc8488114a08e603f1c",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Happy-Fishing.png"
            },
            {
                "game_name": "All-star Fishing",
                "game_code": "9ec2a18752f83e45ccedde8dfeb0f6a7",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/All-star-Fishing.png"
            },
            {
                "game_name": "Dinosaur Tycoon II",
                "game_code": "bbae6016f79f3df74e453eda164c08a4",
                "game_type": "Fish Game",
                "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Dinosaur-Tycoon-II.png"
            }
        ]
}

const jdb = {
    platform: 'digital',
    provider: 'jdb',
    games: [
        {
            "game_name": "Dragon Soar",
            "game_code": "9341a18d096ad901ef77338998f29098",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Soar.png"
        },
        {
            "game_name": "Pop Pop Candy",
            "game_code": "fde142e65f14da39f784e9e5325e0a77",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Pop-Pop-Candy.png"
        },
        {
            "game_name": "Open Sesame Mega",
            "game_code": "cb5e57be0354264c6c7ea0cdf4eb18b3",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Open-Sesame-Mega.png"
        },
        {
            "game_name": "Fruity Bonanza",
            "game_code": "f5d6b418b755f3aefe3b9828f3112c9c",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fruity-Bonanza.png"
        },
        {
            "game_name": "Caishen Coming",
            "game_code": "45ecec5dd5077785e7a09988b95bbd24",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Caishen-Coming.png"
        },
        {
            "game_name": "Coocoo Farm",
            "game_code": "d1f17fd51e474b0e72892332ea551ba1",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Coocoo-Farm.png"
        },
        {
            "game_name": "Elemental Link Water",
            "game_code": "b84274cdfa5731945a34bfd0db1ddeea",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Elemental-Link-Water.png"
        },
        {
            "game_name": "Elemental Link Fire",
            "game_code": "46016a772b92c7f47dfdc5873f184ef1",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Elemental-Link-Fire.png"
        },
        {
            "game_name": "Birdsparty Deluxe",
            "game_code": "786d1cd7f4fa9905c825378292f1204c",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Birdsparty-Deluxe.png"
        },
        {
            "game_name": "Moneybags Man 2",
            "game_code": "33c862e7db9e0e59ab3f8fe770f797da",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Moneybags-Man-2.png"
        },
        {
            "game_name": "Trump Card",
            "game_code": "96c010fc4a95792401e903213d7add44",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Trump-Card.png"
        },
        {
            "game_name": "Fortune Neko",
            "game_code": "49b706ccfe7c53727ee6760cd9a8721a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fortune-Neko.png"
        },
        {
            "game_name": "Book Of Mystery",
            "game_code": "13072a6eb2111c1b5202fe6155227e94",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Book-Of-Mystery.png"
        },
        {
            "game_name": "Prosperitytiger",
            "game_code": "1d704bbb187a113229f3fdaa3b5406fe",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Prosperitytiger.png"
        },
        {
            "game_name": "Glamorous Girl",
            "game_code": "2663e14e5b455525252a25d9bd99e840",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Glamorous-Girl.png"
        },
        {
            "game_name": "Blossom Of Wealth",
            "game_code": "ed6fbaeb7a104dd7ed96fa1683a48669",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Blossom-Of-Wealth.png"
        },
        {
            "game_name": "Big Three Dragons",
            "game_code": "600c338d3fca2da208f1bba2c9d29059",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Big-Three-Dragons.png"
        },
        {
            "game_name": "Mayagoldcrazy",
            "game_code": "6c8009d165293759bb218b72ba3c380f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Mayagoldcrazy.png"
        },
        {
            "game_name": "Lantern Wealth",
            "game_code": "f2f2eae301311f0320ef669b68935546",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Lantern-Wealth.png"
        },
        {
            "game_name": "Marvelous Iv",
            "game_code": "126cf2bfe8a8e606b362d23de02c0d5e",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Marvelous-Iv.png"
        },
        {
            "game_name": "Wonder Elephant",
            "game_code": "540da2ba4c849fc1c315f43ae74df220",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Wonder-Elephant.png"
        },
        {
            "game_name": "Kong",
            "game_code": "f6e9fd31cbc3be8cd3bd95486177377b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Kong.png"
        },
        {
            "game_name": "Lucky Diamond",
            "game_code": "6f6867ad1956a04b174c92629cab7f54",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Lucky-Diamond.png"
        },
        {
            "game_name": "Spindrift 2",
            "game_code": "05dc8c7a43305c3fcb43574c570d6378",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Spindrift-2.png"
        },
        {
            "game_name": "Dragons Gate",
            "game_code": "feaba603992f26633116fb54562e3693",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragons-Gate.png"
        },
        {
            "game_name": "Spindrift",
            "game_code": "b624d1917ef5a740c151e4904a7cf0dd",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Spindrift.png"
        },
        {
            "game_name": "Double Wilds",
            "game_code": "7bd5233c83de0669336ee649e6c8d2b5",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Double-Wilds.png"
        },
        {
            "game_name": "Moneybags Man",
            "game_code": "c4fdebb24ff26fffb3a65d018da8ae92",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Moneybags-Man.png"
        },
        {
            "game_name": "Miner Babe",
            "game_code": "e705514fdd4f9bea5f82bbd0b2c0a353",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Miner-Babe.png"
        },
        {
            "game_name": "Super Niubi Deluxe",
            "game_code": "5d940d11c48b64ec1e6a3c8be5228250",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Super-Niubi-Deluxe.png"
        },
        {
            "game_name": "Funky King Kong",
            "game_code": "cdea2d0670bc40309b4a9b6f942a218a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Funky-King-Kong.png"
        },
        {
            "game_name": "Golden Disco",
            "game_code": "dfb8a198ce0e821560cf543387a2acc2",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Golden-Disco.png"
        },
        {
            "game_name": "Treasure Bowl",
            "game_code": "0651af3e73c7600633522ffe15cc175b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Treasure-Bowl.png"
        },
        {
            "game_name": "Mjolnir",
            "game_code": "e270f0674dff538b181499d18ab47845",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Mjolnir.png"
        },
        {
            "game_name": "Fortune Treasure",
            "game_code": "5a55a19d9cfbead5e64b8169e96bd27a",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fortune-Treasure.png"
        },
        {
            "game_name": "Super Niubi",
            "game_code": "4042e5d0c777e1d3c3bd481dac0a867e",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Super-Niubi.png"
        },
        {
            "game_name": "Dragons World",
            "game_code": "00b886803f3d067f7028872468e84745",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragons-World.png"
        },
        {
            "game_name": "Go Lai Fu",
            "game_code": "a3584394182e8abce362d90c2f048c75",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Go-Lai-Fu.png"
        },
        {
            "game_name": "Birds Party",
            "game_code": "7b497c4d19f87c86ea29910c12129edc",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Birds-Party.png"
        },
        {
            "game_name": "Triple King Kong",
            "game_code": "a9f60e017f2765c74e1ec80473ac4ffa",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Triple-King-Kong.png"
        },
        {
            "game_name": "Orient Animals",
            "game_code": "bdb0459f7e116a20839a3b2a0063a2ff",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Orient-Animals.png"
        },
        {
            "game_name": "Lucky Seven",
            "game_code": "b560b7c42bd29f7d0cda06485a3c4af5",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Lucky-Seven.png"
        },
        {
            "game_name": "Kingsman",
            "game_code": "55e3b4d064b014a403be6ffba8c4343e",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Kingsman.png"
        },
        {
            "game_name": "Dragon",
            "game_code": "735fcdbf9f5e6042132cc01e9860723f",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon.png"
        },
        {
            "game_name": "Dragon Warrior",
            "game_code": "29135c91125ae1655f8c91eb29617705",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Warrior.png"
        },
        {
            "game_name": "Billionaire",
            "game_code": "16b1418fe87a6fa5628eec8cb40da056",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Billionaire.png"
        },
        {
            "game_name": "Legendary 5",
            "game_code": "04a3be36bbf1110345d53e07df9c9cc3",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Legendary-5.png"
        },
        {
            "game_name": "Rooster In Love",
            "game_code": "2f24019dc8abbe05b984611462a1f01c",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Rooster-In-Love.png"
        },
        {
            "game_name": "Xi Yang Yang",
            "game_code": "f1496f1b49981a63e6064ac84517b5ae",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Xi-Yang-Yang.png"
        },
        {
            "game_name": "Fortune Horse",
            "game_code": "ca6e7b621b13077debbf1bf9d5a6c031",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fortune-Horse.png"
        },
        {
            "game_name": "Spirit Tide Legend (Fishing Legend)",
            "game_code": "638d38491dad4a6562713143b1fc6cc1",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Legend.png"
        },
        {
            "game_name": "Fishing Disco",
            "game_code": "e453b811fd1782fd2ade1f93ee0dee32",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Disco.png"
        },
        {
            "game_name": "Dragon Master",
            "game_code": "f691d904ea681ce449263f7e9cc47c35",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Master.png"
        },
        {
            "game_name": "Fishing Yilufa",
            "game_code": "877c97367d24925a11d342726eb0320f",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Yilufa.png"
        },
        {
            "game_name": "Shade Dragons Fishing",
            "game_code": "89e967a8336fb8caad2c1b6d735588fe",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Shade-Dragons-Fishing.png"
        },
        {
            "game_name": "Cai Shen Fishing",
            "game_code": "6df463eabe5fcdaa033e1c89b9ffd162",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Cai-Shen-Fishing.png"
        },
        {
            "game_name": "Dragon Fishing Ii",
            "game_code": "6cef8d8ea517d86602db60fe9781b01b",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Fishing-Ii.png"
        },
        {
            "game_name": "Dragon Fishing",
            "game_code": "1145d7cd96518a5ba2f77cb14cb363c4",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Fishing.png"
        },
        {
            "game_name": "Fighter Fire",
            "game_code": "ff83699bef9b2e773857ed1a9eedc5fb",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fighter-Fire.png"
        }
    ]
}

const evolution = {
    platform: 'live',
    provider: 'evolution',
    games: [
        {
            game_name: 'Baccarat Squeeze',
            game_code: '404f0952ac7e25d242f2079dfe390983',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Baccarat Squeeze.png'
        },
        {
            game_name: 'Speed Baccarat 3',
            game_code: 'e7931b2e0d410ddc4f88520e9ad87c4b',
            game_type: 'CasinoLive',
            game_image: ''
        },
        {
            game_name: 'Speed Baccarat F',
            game_code: 'b332c47c868946659d7de97f4157bdb3',
            game_type: 'CasinoLive',
            game_image: ''
        },
        {
            game_name: 'Emperor Speed Baccarat A',
            game_code: '68fa4cdc74cd23b043db2caa25f1b42c',
            game_type: 'CasinoLive',
            game_image: ''
        },
        {
            game_name: 'Super Sic Bo',
            game_code: 'e3951a5bf624e822a22cba1cbe619df5',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Super Sic Bo.png'
        },
        {
            game_name: 'First Person Top Card',
            game_code: '64985010e87aab51c7fb18076d34062d',
            game_type: 'CasinoLive',
            game_image: ''
        },
        {
            game_name: 'First Person Dream Catcher',
            game_code: '7ee0da50996278d7fe5136f86f368fa5',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dream Catcher.png'
        },
        {
            game_name: 'First Person Dragon Tiger',
            game_code: '4b4c45709dfd8188d7d6d12fae15bd42',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dragon Tiger.png'
        },
        {
            game_name: 'First Person Mega Ball',
            game_code: '3150b1cd8fbbddd94d36f20fab504653',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Mega Ball.png'
        },
        {
            game_name: 'First Person Lightning Baccarat',
            game_code: 'fec1b730e804bf14bd471a1e9b82bf44',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Baccarat.png'
        },
        {
            game_name: 'First Person Craps',
            game_code: '823245918aa2afd108a5912e363c083c',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Craps.png'
        },
        {
            game_name: 'First Person Baccarat',
            game_code: 'e18dfa4a5dd4a0f2d8b45337bd6abb9d',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Baccarat.png'
        },
        {
            game_name: 'First Person Golden Wealth Baccarat',
            game_code: '88e49e3fb9a9883f01f167d03f5efdcb',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Golden Wealth Baccarat.png'
        },
        {
            game_name: 'First Person American Roulette',
            game_code: '88b2d98462fbc45d6d31e95083e183df',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person American Roulette.png'
        },
        {
            game_name: 'First Person Deal or No Deal',
            game_code: 'c715eb06391fabe5275d0b56440f49f3',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Deal or No Deal.png'
        },
        {
            game_name: 'First Person Blackjack',
            game_code: '4ac0e874a4d5fc55bcdba5302b43bc96',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Blackjack.png'
        },
        {
            game_name: 'First Person Lightning Blackjack',
            game_code: '74914b065a9e6b9c7cb8a0e4b17294ed',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Blackjack.png'
        },
        {
            game_name: 'First Person Roulette',
            game_code: 'a82670530f49a6b3445dc1a592a2eb9e',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Roulette.png'
        },
        {
            game_name: 'Dream Catcher',
            game_code: '7f50a6fbfcd9257299303b5757d43525',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Dream Catcher.png'
        },
        {
            game_name: 'Football Studio Dice',
            game_code: '1909b4e3380dc37654f8e3997e63ec1b',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Football Studio Dice.png'
        },
        {
            game_name: 'Dead or Alive: Saloon',
            game_code: 'eda1a2c5edb8370f8df58dcf8e1381b9',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Dead or Alive: Saloon.png'
        },
        {
            game_name: 'First Person Lightning Roulette',
            game_code: 'f5ee6fce16d369d1a656f3b227fc7236',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Roulette.png'
        }
    ]


}
const popular = {
    platform: 'live',
    provider: 'popular',
    games: [
        {
            game_name: 'Baccarat Squeeze',
            game_code: '404f0952ac7e25d242f2079dfe390983',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Baccarat Squeeze.png'
        }
    ]
}
const favorite = {
    platform: 'live',
    provider: 'favorite',
    games: [
        {
            game_name: 'Baccarat Squeeze',
            game_code: '404f0952ac7e25d242f2079dfe390983',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Baccarat Squeeze.png'
        }
    ]
}
const live = {
    platform: 'live',
    provider: 'live',
    games: [
        {
            game_name: 'Super Sic Bo',
            game_code: 'e3951a5bf624e822a22cba1cbe619df5',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/Super Sic Bo.png'
        },
        {
            game_name: 'First Person Top Card',
            game_code: '64985010e87aab51c7fb18076d34062d',
            game_type: 'CasinoLive',
            game_image: ''
        },
        {
            game_name: 'First Person Dream Catcher',
            game_code: '7ee0da50996278d7fe5136f86f368fa5',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dream Catcher.png'
        },
        {
            game_name: 'First Person Dragon Tiger',
            game_code: '4b4c45709dfd8188d7d6d12fae15bd42',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Dragon Tiger.png'
        },
        {
            game_name: 'First Person Mega Ball',
            game_code: '3150b1cd8fbbddd94d36f20fab504653',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Mega Ball.png'
        },
        {
            game_name: 'First Person Lightning Baccarat',
            game_code: 'fec1b730e804bf14bd471a1e9b82bf44',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Lightning Baccarat.png'
        },
        {
            game_name: 'First Person Craps',
            game_code: '823245918aa2afd108a5912e363c083c',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Craps.png'
        },
        {
            game_name: 'First Person Baccarat',
            game_code: 'e18dfa4a5dd4a0f2d8b45337bd6abb9d',
            game_type: 'CasinoLive',
            game_image: 'https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/evoplay/First Person Baccarat.png'
        },
    ]
}
const slot = {
    platform: 'live',
    provider: 'slot',
    games: [
        {
            "game_name": "Chin Shi Huang",
            "game_code": "24da72b49b0dd0e5cbef9579d09d8981",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Chin-Shi-Huang.png"
        },
        {
            "game_name": "God Of Martial",
            "game_code": "21ef8a7ddd39836979170a2e7584e333",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/God-Of-Martial.png"
        },
        {
            "game_name": "Hot Chilli",
            "game_code": "c845960c81d27d7880a636424e53964d",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Hot-Chilli.png"
        },
        {
            "game_name": "Fortune Tree",
            "game_code": "6a7e156ceec5c581cd6b9251854fe504",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/Fortune-Tree.png"
        },
        {
            "game_name": "War Of Dragons",
            "game_code": "4b1d7ffaf9f66e6152ea93a6d0e4215b",
            "game_type": "Slot Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jili/War-Of-Dragons.png"
        },
    ]
}
const fish = {
    platform: 'live',
    provider: 'fish',
    games: [
        {
            "game_name": "Spirit Tide Legend (Fishing Legend)",
            "game_code": "638d38491dad4a6562713143b1fc6cc1",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Legend.png"
        },
        {
            "game_name": "Fishing Disco",
            "game_code": "e453b811fd1782fd2ade1f93ee0dee32",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Disco.png"
        },
        {
            "game_name": "Dragon Master",
            "game_code": "f691d904ea681ce449263f7e9cc47c35",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Master.png"
        },
        {
            "game_name": "Fishing Yilufa",
            "game_code": "877c97367d24925a11d342726eb0320f",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fishing-Yilufa.png"
        },
        {
            "game_name": "Shade Dragons Fishing",
            "game_code": "89e967a8336fb8caad2c1b6d735588fe",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Shade-Dragons-Fishing.png"
        },
        {
            "game_name": "Cai Shen Fishing",
            "game_code": "6df463eabe5fcdaa033e1c89b9ffd162",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Cai-Shen-Fishing.png"
        },
        {
            "game_name": "Dragon Fishing Ii",
            "game_code": "6cef8d8ea517d86602db60fe9781b01b",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Fishing-Ii.png"
        },
        {
            "game_name": "Dragon Fishing",
            "game_code": "1145d7cd96518a5ba2f77cb14cb363c4",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Dragon-Fishing.png"
        },
        {
            "game_name": "Fighter Fire",
            "game_code": "ff83699bef9b2e773857ed1a9eedc5fb",
            "game_type": "Fish Game",
            "game_image": "https://huidu-bucket.s3.ap-southeast-1.amazonaws.com/api/jdb/Fighter-Fire.png"
        }
    ]
}

const allProviderGames: ProviderGame[] = [
    evolution,
    pgsoft,
    jilli,
    jdb,
    cq9,
    popular,
    live,
    slot,
    fish,
    favorite
]


export { gameData, categories, coinFaces, allProviderGames, jilli };