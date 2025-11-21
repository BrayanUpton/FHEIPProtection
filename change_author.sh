#!/bin/sh

git filter-branch --env-filter '

# --- 配置区域开始 ---

# 这里填入你想识别为 "GeovanniParker" 的旧邮箱或旧名字
# 如果原提交的邮箱是这个，就会变成 Geovanni，否则就会变成 Brayan
OLD_EMAIL="你的旧邮箱@example.com"

# --- 配置区域结束 ---

# 逻辑判断：如果原有邮箱等于旧邮箱，就改为 Geovanni
if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ] || [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ];
then
    export GIT_AUTHOR_NAME="GeovanniParker"
    export GIT_AUTHOR_EMAIL="vajeqpdigr@outlook.com"
    export GIT_COMMITTER_NAME="GeovanniParker"
    export GIT_COMMITTER_EMAIL="vajeqpdigr@outlook.com"
else
    # 剩下的所有情况（Rest part），全部改为 BrayanUpton
    export GIT_AUTHOR_NAME="BrayanUpton"
    export GIT_AUTHOR_EMAIL="nfXbhZPY57968@outlook.com"
    export GIT_COMMITTER_NAME="BrayanUpton"
    export GIT_COMMITTER_EMAIL="nfXbhZPY57968@outlook.com"
fi
' --tag-name-filter cat -- --branches --tags
