from flask import Response, request
from flask_restful import Resource
from mongoengine import DoesNotExist, Q
import models
import json

class CommentListEndpoint(Resource):
    
    def get(self):
        # Goal: list all of the comments that are currently in my database:
        keyword = request.args.get('keyword')
        if keyword:
            # find data where *any of the fields contain the term...
            data = models.Comment.objects.filter(
                Q(comment__icontains=keyword) |
                Q(author__icontains=keyword)
            )
        else:
            data = models.Comment.objects

        # formatting the output JSON
        data = self.queryset_to_serialized_list(data)
        return Response(json.dumps(data), mimetype="application/json", status=200)

    def post(self):
        body = request.get_json()
        # do some data validation here:
        # comment = What data the text of the comment
        # author = the name of the author
        # post = the id of the post
        print(body)
        comment = models.Comment(**body).save()
        serialized_data = {
            'id': str(comment.id),
            'message': 'Comment {0} successfully created.'.format(comment.id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=201)
        #return Response(json.dumps([]), mimetype="application/json", status=201)

        
class CommentDetailEndpoint(Resource):
    def put(self, id):
        comments = models.Comment.objects.get(id=id)
        request_data = request.get_json()

        comments.comment = request_data.get('comment')
        comments.author = request_data.get('author')
        #comments.post = request_data.get('post_id')
        comments.save()
        print(comments.to_json())
        return Response(comments.to_json(), mimetype="application/json", status=200)
        #return Response(json.dumps([]), mimetype="application/json", status=200)
    
    def delete(self, id):
        comment = models.Comment.objects.get(id=id)
        comment.delete()
        serialized_data = {
            'message': 'Comment {0} successfully deleted.'.format(id)
        }
        return Response(json.dumps(serialized_data), mimetype="application/json", status=200)
        #return Response(json.dumps([]), mimetype="application/json", status=200)

    def get(self, id):
        comment = models.Comment.objects.get(id=id)
        return Response(comment.to_json(), mimetype="application/json", status=200)
        #return Response(json.dumps([]), mimetype="application/json", status=200)

def initialize_routes(api):
    api.add_resource(CommentListEndpoint, '/api/comments', '/api/comments/')
    api.add_resource(CommentDetailEndpoint, '/api/comments/<id>', '/api/comments/<id>/')
    # api.add_resource(CommentListEndpoint, '/api/posts/<post_id>/comments', '/api/posts/<post_id>/comments/')
    # api.add_resource(CommentDetailEndpoint, '/api/posts/<post_id>/comments/<id>', '/api/posts/<post_id>/comments/<id>/')