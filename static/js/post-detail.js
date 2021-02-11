
let activePost;


// gets post from the server:
const getPost = () => {
    // get post id from url address:

    const url = window.location.href;
    id = url.substring(url.lastIndexOf('#') + 1);
    // fetch post:
    fetch('/api/posts/' + id + '/')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            activePost = data;
            renderPost();
        });
};

const getComment = () => {
    fetch('/api/comments')
        .then(response => response.json())
        .then(displayComments);
};

const displayComments = (data) => {
    console.log('hahahahaha', data);

    const entries = [];
    for (const post of data) {
        if (post.post_id == id){
            console.log(post.post_id);
            entries.push(renderComments(post));
        }
    }
    document.querySelector('.comments').innerHTML = entries.join('\n');
};

const renderComments = (post) => {
    // formatting the date:
    const paragraphs = '<p>' + post.comment.split('\n').join('</p><p>') + '</p>';
    const template = `
    <div class = 'CommentID'>
            <p><strong>${post.author+':'}</strong></p>
            <div class = 'content' style="text-indent:2em;">${paragraphs}</div>
            <i class = 'fa fa-trash' id = 'idid' aria-hidden = "true" type="button" onclick = deleteComments('${post.id}')></i>
    </div>
    `;
    return template;
};

const addComments = () => {
    const template = `
        <h1>Add a comment</h1>
        <div class="input-section">
              <input type="text" name="author" id="autho" placeholder="Name">
        </div>
        <div class="input-section">
              <textarea name="content" id="comment" placeholder="Comments..."></textarea>
        </div>
              <button class="btn btn-main" id="sav" type="submit">Submit</button>
              <a class="btn" href="/post/#${id}">Cancel</a>
       
    `;
    document.querySelector('.add-comment').innerHTML = template;
    document.querySelector('#sav').onclick = createComments;
    //document.querySelector('#cance').onclick = renderPost;
};

const createComments = (ev) => {
    const data = {
        comment: document.querySelector('#comment').value,
        author: document.querySelector('#autho').value,
        post: id
    };
    if (data.author != '' && data.comment != ''){
        console.log(data);
    fetch('/api/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {initializePage()}
);
    }
    else{
        initializePage()
    }



    // this line overrides the default form functionality:
};

const deleteComments = (comment_id) => {
    const doIt = confirm('Are you sure you want to delete this comment?');
    if (!doIt) {
        return;
    }
    fetch('/api/comments/' + comment_id + '/', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // navigate back to main page:
        initializePage()
    });
    ev.preventDefault()
};

// updates the post:
const updatePost = (ev) => {
    const data = {
        title: document.querySelector('#title').value,
        content: document.querySelector('#content').value,
        author: document.querySelector('#author').value
    };
    console.log(data);
    fetch('/api/posts/' + activePost.id + '/', { 
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            activePost = data;
            renderPost();
            showConfirmation();
        });
    
    // this line overrides the default form functionality:
    ev.preventDefault();
};

const deletePost = (ev) => {
    const doIt = confirm('Are you sure you want to delete this blog post?');
    if (!doIt) {
        return;
    }
    fetch('/api/posts/' + activePost.id + '/', { 
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // navigate back to main page:
        window.location.href = '/';
    });
    ev.preventDefault()
};

// creates the HTML to display the post:
const renderPost = (ev) => {
    const paragraphs = '<p>' + activePost.content.split('\n').join('</p><p>') + '</p>';
    const template = `
        <p id="confirmation" class="hide"></p>
        <h1>${activePost.title}</h1>
        <div class="date">${formatDate(activePost.published)}</div>
        <div class="content">${paragraphs}</div>
        <p>
            <strong>Author: </strong>${activePost.author}
        </p>
    `;
    document.querySelector('.post').innerHTML = template;
    toggleVisibility('view');

    // prevent built-in form submission:
    if (ev) { ev.preventDefault(); }
};

// creates the HTML to display the editable form:
const renderForm = () => {
    const htmlSnippet = `
        <div class="input-section">
            <label for="title">Title</label>
            <input type="text" name="title" id="title" value="${activePost.title}">
        </div>
        <div class="input-section">
            <label for="author">Author</label>
            <input type="text" name="author" id="author" value="${activePost.author}">
        </div>
        <div class="input-section">
            <label for="content">Content</label>
            <textarea name="content" id="content">${activePost.content}</textarea>
        </div>
        <button class="btn btn-main" id="save" type="submit">Save</button>
        <button class="btn" id="cancel" type="submit">Cancel</button>
    `;

    // after you've updated the DOM, add the event handlers:
    document.querySelector('#post-form').innerHTML = htmlSnippet;
    document.querySelector('#save').onclick = updatePost;
    document.querySelector('#cancel').onclick = renderPost;
    toggleVisibility('edit');
};

const formatDate = (date) => {
    const options = { 
        weekday: 'long', year: 'numeric', 
        month: 'long', day: 'numeric' 
    };
    return new Date(date).toLocaleDateString('en-US', options); 
};

// handles what is visible and what is invisible on the page:
const toggleVisibility = (mode) => {
    if (mode === 'view') {
        document.querySelector('#view-post').classList.remove('hide');
        document.querySelector('#menu').classList.remove('hide');
        document.querySelector('#post-form').classList.add('hide');
    } else {
        document.querySelector('#view-post').classList.add('hide');
        document.querySelector('#menu').classList.add('hide');
        document.querySelector('#post-form').classList.remove('hide');
    }
};

const showConfirmation = () => {
    document.querySelector('#confirmation').classList.remove('hide');
    document.querySelector('#confirmation').innerHTML = 'Post successfully saved.';
};

// called when the page loads:
const initializePage = () => {
    // get the post from the server:
    getPost();

    getComment();
    addComments();
    // add button event handler (right-hand corner:
    //document.querySelector('#sav').onclick = createComments;
    document.querySelector('#edit-button').onclick = renderForm;
    document.querySelector('#delete-button').onclick = deletePost;
};

initializePage();
